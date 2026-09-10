import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search } from "lucide-react";
import api from "../api";
import {
  PriorityBadge,
  StatusBadge,
  Empty
} from "../components/TicketUI";

function Tickets({ user, assignedOnly = false }) {
  const [data, setData] = useState({
    tickets: [],
    pages: 1,
    total: 0,
    page: 1
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [page, setPage] = useState(1);

  const load = async (
    searchValue = search,
    statusValue = status,
    priorityValue = priority,
    pageValue = page
  ) => {
    try {
      const response = await api.get("/tickets", {
        params: {
          search: searchValue.trim(),
          status: statusValue,
          priority: priorityValue,
          page: pageValue
        }
      });

      const result = response.data || {};

      let tickets = Array.isArray(result.tickets)
        ? result.tickets
        : [];

      if (
        assignedOnly &&
        user?.role === "agent"
      ) {
        tickets = tickets.filter((ticket) => {
          if (!ticket.assignedTo) {
            return false;
          }

          const assignedId =
            ticket.assignedTo?._id ||
            ticket.assignedTo;

          return (
            String(assignedId) ===
            String(user.id)
          );
        });
      }

      setData({
        ...result,
        tickets,
        total: assignedOnly
          ? tickets.length
          : Number(result.total || 0),
        pages: assignedOnly
          ? 1
          : Number(result.pages || 1),
        page: Number(
          result.page || pageValue
        )
      });
    } catch (error) {
      console.error(
        "Failed to load tickets:",
        error
      );

      setData({
        tickets: [],
        pages: 1,
        total: 0,
        page: 1
      });
    }
  };

  useEffect(() => {
    load(
      search,
      status,
      priority,
      page
    );
  }, [
    status,
    priority,
    page,
    assignedOnly
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load(
        search,
        status,
        priority,
        1
      );
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      setPage(1);

      load(
        search,
        status,
        priority,
        1
      );
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);

    load(
      "",
      status,
      priority,
      1
    );
  };

  const title =
    assignedOnly &&
    user?.role === "agent"
      ? "Assigned Tickets"
      : user?.role === "customer"
      ? "My Tickets"
      : "Ticket Queue";

  const description =
    assignedOnly &&
    user?.role === "agent"
      ? `${data.total} tickets assigned to you.`
      : `${data.total} requests in your current workspace.`;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow dark">
            {assignedOnly &&
            user?.role === "agent"
              ? "ASSIGNED TICKETS"
              : "TICKETS"}
          </div>

          <h1>{title}</h1>

          <p>{description}</p>
        </div>

        {user?.role === "customer" && (
          <Link
            to="/tickets/new"
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            New Ticket
          </Link>
        )}
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              handleSearchChange(
                e.target.value
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
            placeholder="Search by title or description"
            autoComplete="off"
          />

          {search && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              aria-label="Clear search"
              style={{
                border: "0",
                background: "transparent",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#999",
                fontSize: "18px",
                lineHeight: 1
              }}
            >
              ×
            </button>
          )}
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option>All</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>

        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
        >
          <option>All</option>
          <option>Urgent</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {data.tickets.map(
                (ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="table-ticket"
                      >
                        <b>
                          #{ticket.ticketNumber}
                        </b>

                        <span>
                          {ticket.title}
                        </span>
                      </Link>
                    </td>

                    <td>
                      {ticket.category?.name ||
                        "—"}
                    </td>

                    <td>
                      <PriorityBadge
                        priority={
                          ticket.priority
                        }
                      />
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          ticket.status
                        }
                      />
                    </td>

                    <td>
                      {ticket.updatedAt
                        ? new Date(
                            ticket.updatedAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <Link
                        className="view-btn"
                        to={`/tickets/${ticket._id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              )}

              {!data.tickets.length && (
                <tr>
                  <td colSpan="6">
                    <Empty
                      title={
                        assignedOnly &&
                        user?.role ===
                          "agent"
                          ? "No assigned tickets"
                          : "No matching tickets"
                      }
                      text={
                        assignedOnly &&
                        user?.role ===
                          "agent"
                          ? "There are currently no tickets assigned to you."
                          : search
                          ? `No tickets found for "${search}".`
                          : "Try changing your search or filters."
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Page {data.page} of{" "}
            {data.pages}
          </span>

          <div>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage(page - 1)
              }
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >= data.pages
              }
              onClick={() =>
                setPage(page + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Tickets;