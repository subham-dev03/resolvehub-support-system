import React, { useEffect, useRef, useState } from "react";
import { Bell, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Topbar({ user }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const workspace =
    user?.role === "admin"
      ? "Admin Console"
      : user?.role === "agent"
        ? "Agent Workspace"
        : "Customer Portal";

  const getStorageKey = () => {
    const userId = user?.id || user?._id;

    if (!userId) {
      return null;
    }

    return `helpdesk_read_notifications_${userId}`;
  };

  const getNotificationId = (
    ticket,
    activity,
    index
  ) => {
    return (
      activity?._id ||
      `${ticket._id}_${activity?.createdAt || index}_${activity?.action || "activity"}`
    );
  };


  const loadNotifications = async () => {
    try {
      const response = await api.get("/tickets");

      let tickets =
        response.data?.tickets ||
        response.data ||
        [];

      if (!Array.isArray(tickets)) {
        tickets = [];
      }

      const currentUserId = String(
        user?.id ||
        user?._id ||
        ""
      );

      const currentUserRole = user?.role;

      const activityList = [];

      tickets.forEach((ticket) => {
        if (!Array.isArray(ticket.activity)) {
          return;
        }

        ticket.activity.forEach(
          (activity, index) => {
            const activityUser =
              activity.by;

            const activityUserId =
              String(
                activityUser?._id ||
                activityUser?.id ||
                activityUser ||
                ""
              );

            const activityUserRole =
              activityUser?.role || "";


            if (
              activityUserId &&
              currentUserId &&
              activityUserId ===
              currentUserId
            ) {
              return;
            }


            if (
              activityUserRole ===
              "customer"
            ) {
              if (
                currentUserRole !==
                "agent" &&
                currentUserRole !==
                "admin"
              ) {
                return;
              }
            }


            if (
              activityUserRole ===
              "agent"
            ) {
              if (
                currentUserRole !==
                "customer" &&
                currentUserRole !==
                "admin"
              ) {
                return;
              }


              if (
                currentUserRole ===
                "customer" &&
                ticket.createdBy
              ) {
                const ticketOwnerId =
                  String(
                    ticket.createdBy?._id ||
                    ticket.createdBy?.id ||
                    ticket.createdBy
                  );

                if (
                  ticketOwnerId !==
                  currentUserId
                ) {
                  return;
                }
              }
            }


            if (
              activityUserRole ===
              "admin"
            ) {
              if (
                currentUserRole ===
                "admin"
              ) {
                return;
              }
            }



            if (!activityUserRole) {
              if (
                activityUserId &&
                activityUserId ===
                currentUserId
              ) {
                return;
              }
            }


            activityList.push({
              id: getNotificationId(
                ticket,
                activity,
                index
              ),

              ticketId:
                ticket._id,

              ticketNumber:
                ticket.ticketNumber,

              title:
                ticket.title,

              action:
                activity.action ||
                "Ticket activity",

              createdAt:
                activity.createdAt ||
                ticket.updatedAt,

              byName:
                activityUser?.name ||
                activityUser?.email ||
                "User",

              byRole:
                activityUserRole,
            });
          }
        );
      });


      activityList.sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );


      const uniqueActivities = [];

      const seen = new Set();

      activityList.forEach(
        (item) => {
          if (
            !seen.has(item.id)
          ) {
            seen.add(item.id);

            uniqueActivities.push(
              item
            );
          }
        }
      );

      setNotifications(
        uniqueActivities
      );


      const storageKey =
        getStorageKey();

      if (!storageKey) {
        setUnreadCount(0);
        return;
      }

      const readNotifications =
        JSON.parse(
          localStorage.getItem(
            storageKey
          ) || "[]"
        );

      const unread =
        uniqueActivities.filter(
          (notification) =>
            !readNotifications.includes(
              notification.id
            )
        );

      setUnreadCount(
        unread.length
      );
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    }
  };



  useEffect(() => {
    if (!user) {
      return;
    }

    loadNotifications();

    const interval =
      setInterval(() => {
        loadNotifications();
      }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);



  const handleBellClick = () => {
    const willOpen =
      !showNotifications;

    setShowNotifications(
      willOpen
    );

    setShowSearch(false);



    if (willOpen && user) {
      const storageKey =
        getStorageKey();

      if (storageKey) {
        const allNotificationIds =
          notifications.map(
            (notification) =>
              notification.id
          );

        localStorage.setItem(
          storageKey,
          JSON.stringify(
            allNotificationIds
          )
        );

        setUnreadCount(0);
      }
    }
  };



  const handleNotificationClick = (
    notification
  ) => {
    setShowNotifications(false);

    navigate(
      `/tickets/${notification.ticketId}`
    );
  };


  const handleSearch = async (
    value
  ) => {
    setSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response =
        await api.get(
          `/tickets?search=${encodeURIComponent(
            value
          )}`
        );

      let tickets =
        response.data?.tickets ||
        response.data ||
        [];

      if (!Array.isArray(tickets)) {
        tickets = [];
      }

      setSearchResults(
        tickets.slice(0, 8)
      );
    } catch (error) {
      console.error(
        "Search failed:",
        error
      );

      setSearchResults([]);
    }
  };


  const handleSearchResultClick = (
    ticket
  ) => {
    setSearch("");

    setSearchResults([]);

    setShowSearch(false);

    navigate(
      `/tickets/${ticket._id}`
    );
  };



  const clearSearch = () => {
    setSearch("");

    setSearchResults([]);
  };



  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const activityDate =
      new Date(date);

    const now = new Date();

    const difference =
      now.getTime() -
      activityDate.getTime();

    const seconds =
      Math.floor(
        difference / 1000
      );

    const minutes =
      Math.floor(
        seconds / 60
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const days =
      Math.floor(
        hours / 24
      );

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return activityDate.toLocaleDateString();
  };


  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(
          false
        );
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  return (
    <header className="topbar">
      <div>
        <span className="crumb">
          Workspace /
        </span>

        <b>{workspace}</b>
      </div>

      <div className="top-actions">


        <div
          className="top-search-wrapper"
          ref={searchRef}
        >

          <div
            className="top-search"
            onClick={() => {
              if (window.innerWidth <= 760) {
                navigate("/tickets");
                return;
              }

              setShowSearch(true);
            }}
          >
            <Search size={16} />

            <input
              type="text"
              value={search}
              placeholder="Search tickets..."
              onFocus={() =>
                setShowSearch(true)
              }
              onChange={(event) =>
                handleSearch(event.target.value)
              }
              onClick={(event) => {
                if (window.innerWidth <= 760) {
                  event.stopPropagation();
                }
              }}
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={(event) => {
                  event.stopPropagation();
                  clearSearch();
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>




          {showSearch &&
            search.trim() &&
            searchResults.length >
            0 && (
              <div className="top-search-dropdown">

                {searchResults.map(
                  (ticket) => (
                    <button
                      type="button"
                      className="search-result"
                      key={
                        ticket._id
                      }
                      onClick={() =>
                        handleSearchResultClick(
                          ticket
                        )
                      }
                    >
                      <div className="search-result-number">
                        #
                        {
                          ticket.ticketNumber
                        }
                      </div>

                      <div className="search-result-content">
                        <strong>
                          {
                            ticket.title
                          }
                        </strong>

                        <span>
                          {
                            ticket.status
                          }{" "}
                          •{" "}
                          {
                            ticket.priority
                          }
                        </span>
                      </div>
                    </button>
                  )
                )}

              </div>
            )}


          {showSearch &&
            search.trim() &&
            searchResults.length ===
            0 && (
              <div className="top-search-dropdown">
                <div className="search-empty">
                  No tickets found
                </div>
              </div>
            )}
        </div>

        <div
          className="notification-wrapper"
          ref={notificationRef}
        >
          <button
            type="button"
            className="icon-btn notification-button"
            onClick={
              handleBellClick
            }
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>


          {showNotifications && (
            <div className="notification-dropdown">

              <div className="notification-header">
                <div>
                  <strong>
                    Notifications
                  </strong>

                  <span>
                    {
                      notifications.length
                    }{" "}
                    activities
                  </span>
                </div>
              </div>

              <div className="notification-list">

                {notifications.length ===
                  0 ? (
                  <div className="notification-empty">
                    <Bell size={22} />

                    <p>
                      No activity yet
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (
                      notification
                    ) => (
                      <button
                        type="button"
                        className="notification-item"
                        key={
                          notification.id
                        }
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >
                        <div className="notification-icon">
                          <Bell size={15} />
                        </div>

                        <div className="notification-content">

                          <strong>
                            {
                              notification.action
                            }
                          </strong>

                          <p>
                            {
                              notification.byName
                            }
                          </p>

                          <span>
                            Ticket #
                            {
                              notification.ticketNumber
                            }{" "}
                            •{" "}
                            {
                              notification.title
                            }
                          </span>

                          <small>
                            {formatDate(
                              notification.createdAt
                            )}
                          </small>

                        </div>
                      </button>
                    )
                  )
                )}

              </div>
            </div>
          )}
        </div>


        <div className="top-avatar">
          {user?.name?.[0]?.toUpperCase() ||
            "U"}
        </div>

      </div>
    </header>
  );
}

export default Topbar;