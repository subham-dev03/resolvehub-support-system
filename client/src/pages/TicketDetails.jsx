import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  X,
  FileText,
  Download
} from "lucide-react";
import api from "../api";
import {
  StatusBadge,
  PriorityBadge
} from "../components/TicketUI";

function TicketDetails({ user }) {
  const { id } = useParams();

  const [t, setT] = useState(null);
  const [agents, setAgents] = useState([]);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] =
    useState(null);

  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 760px)").matches
  );

  useEffect(() => {
    const media = window.matchMedia(
      "(max-width: 760px)"
    );

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    media.addEventListener(
      "change",
      handleChange
    );

    return () => {
      media.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  const load = async () => {
    try {
      const r = await api.get(
        `/tickets/${id}`
      );

      setT(r.data);
      setError("");
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Ticket unavailable"
      );
    }
  };

  useEffect(() => {
    load();

    if (user.role === "admin") {
      api
        .get("/users/agents")
        .then((r) => setAgents(r.data))
        .catch(() => setAgents([]));
    }
  }, [id, user.role]);

  const comments = useMemo(() => {
    return [...(t?.comments || [])].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [t?.comments]);

  const scrollCommentsToBottom = () => {
    if (isMobile) return;

    const container =
      document.querySelector(".comments");

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop =
        container.scrollHeight;
    });
  };

  useLayoutEffect(() => {
    if (!t || isMobile) return;

    scrollCommentsToBottom();

    const timer = setTimeout(() => {
      scrollCommentsToBottom();
    }, 150);

    return () => clearTimeout(timer);
  }, [
    t?.comments?.length,
    isMobile
  ]);

  const update = async (payload) => {
    setSaving(true);
    setError("");

    try {
      await api.patch(
        `/tickets/${id}`,
        payload
      );

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(
      e.target.files || []
    );

    if (!selected.length) return;

    const validFiles = selected.filter(
      (file) =>
        file.size <= 10 * 1024 * 1024
    );

    if (
      validFiles.length !==
      selected.length
    ) {
      setError(
        "Each attachment must be 10MB or smaller."
      );
    } else {
      setError("");
    }

    setFiles((prev) => [
      ...prev,
      ...validFiles
    ]);

    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  const reply = async (e) => {
    e.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage &&
      files.length === 0
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append(
        "message",
        trimmedMessage
      );

      files.forEach((file) => {
        formData.append(
          "attachments",
          file
        );
      });

      await api.post(
        `/tickets/${id}/comments`,
        formData
      );

      setMessage("");
      setFiles([]);

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Reply failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const getFileUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http")) {
      return url;
    }

    return `http://localhost:5000${url}`;
  };

  const isImage = (type) => {
    return type?.startsWith("image/");
  };

  if (error && !t) {
    return (
      <div className="error-box">
        {error}
      </div>
    );
  }

  if (!t) {
    return (
      <div className="loading">
        Loading ticket…
      </div>
    );
  }

  const canManage =
    user.role === "admin" ||
    user.role === "agent";

  const currentUserId = String(
    user?.id ||
      user?._id ||
      ""
  );

  const visibleComments = isMobile
    ? [...comments].reverse()
    : comments;

  return (
    <div className="ticket-details-page">
      <Link
        to="/tickets"
        className="back-link"
      >
        ← Back to tickets
      </Link>

      <div className="ticket-detail-head">
        <div>
          <div className="eyebrow dark">
            TICKET #{t.ticketNumber}
          </div>

          <h1>{t.title}</h1>

          <p>
            Created{" "}
            {new Date(
              t.createdAt
            ).toLocaleString()}{" "}
            by {t.createdBy?.name}
          </p>
        </div>

        <div className="detail-badges">
          <StatusBadge
            status={t.status}
          />

          <PriorityBadge
            priority={t.priority}
          />
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <div className="detail-section">
            <h3>
              Problem description
            </h3>

            <p className="description">
              {t.description}
            </p>
          </div>

          <div className="detail-section conversation-section">
            <h3>
              Conversation{" "}
              <span>
                {t.comments?.length || 0}
              </span>
            </h3>

            <div
              className={`comments ${
                isMobile
                  ? "comments-mobile"
                  : ""
              }`}
            >
              {visibleComments.map(
                (c, i) => {
                  const commentUserId =
                    String(
                      c.user?._id ||
                        c.user?.id ||
                        ""
                    );

                  const isMine =
                    commentUserId ===
                    currentUserId;

                  return (
                    <div
                      key={
                        c._id || i
                      }
                      className={`comment ${
                        isMine
                          ? "mine"
                          : "other"
                      }`}
                    >
                      <div className="avatar small">
                        {c.user?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "?"}
                      </div>

                      <div className="comment-content">
                        <div className="comment-meta">
                          <b>
                            {c.user?.name ||
                              "Unknown User"}
                          </b>

                          <span className="comment-role">
                            {c.user?.role ||
                              "user"}
                          </span>

                          <time>
                            {new Date(
                              c.createdAt
                            ).toLocaleString()}
                          </time>
                        </div>

                        {c.message && (
                          <div className="comment-message">
                            {c.message}
                          </div>
                        )}

                        {c.attachments
                          ?.length > 0 && (
                          <div className="comment-attachments">
                            {c.attachments.map(
                              (
                                file,
                                fileIndex
                              ) => {
                                const url =
                                  getFileUrl(
                                    file.url
                                  );

                                return (
                                  <div
                                    key={
                                      fileIndex
                                    }
                                    className="chat-attachment"
                                  >
                                    {isImage(
                                      file.type
                                    ) ? (
                                      <div
                                        className="chat-image-link"
                                        onClick={() =>
                                          setPreviewImage(
                                            url
                                          )
                                        }
                                      >
                                        <img
                                          src={
                                            url
                                          }
                                          alt={
                                            file.name
                                          }
                                          className="chat-image"
                                          onLoad={
                                            scrollCommentsToBottom
                                          }
                                        />
                                      </div>
                                    ) : (
                                      <a
                                        href={
                                          url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="chat-file"
                                      >
                                        <FileText
                                          size={
                                            22
                                          }
                                        />

                                        <span>
                                          {
                                            file.name
                                          }
                                        </span>

                                        <Download
                                          size={
                                            17
                                          }
                                        />
                                      </a>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}

              {!t.comments
                ?.length && (
                <p className="muted">
                  No replies yet.
                </p>
              )}
            </div>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            {files.length > 0 && (
              <div className="selected-files">
                {files.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="selected-file"
                    >
                      {file.type.startsWith(
                        "image/"
                      ) ? (
                        <img
                          src={URL.createObjectURL(
                            file
                          )}
                          alt={
                            file.name
                          }
                          className="selected-image"
                        />
                      ) : (
                        <FileText
                          size={20}
                        />
                      )}

                      <span>
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(
                            index
                          )
                        }
                        aria-label="Remove file"
                      >
                        <X
                          size={16}
                        />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <form
              className="reply-form"
              onSubmit={reply}
            >
              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                placeholder="Write a reply…"
              />

              <div className="reply-actions">
                <div className="attachment-buttons">
                  <label
                    className="attachment-btn"
                    title="Attach file"
                  >
                    <Paperclip
                      size={17}
                    />

                    <span>
                      File
                    </span>

                    <input
                      type="file"
                      multiple
                      onChange={
                        handleFileChange
                      }
                    />
                  </label>

                  <label
                    className="attachment-btn"
                    title="Attach photo"
                  >
                    <ImageIcon
                      size={17}
                    />

                    <span>
                      Photo
                    </span>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={
                        handleFileChange
                      }
                    />
                  </label>
                </div>

                <button
                  disabled={
                    saving ||
                    (!message.trim() &&
                      files.length ===
                        0)
                  }
                  className="btn btn-primary"
                  type="submit"
                >
                  {saving
                    ? "Sending..."
                    : "Send Reply"}

                  <MessageSquare
                    size={17}
                  />
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="panel detail-side">
          <h3>
            Ticket controls
          </h3>

          {canManage ? (
            <>
              <label>
                Status

                <select
                  value={t.status}
                  onChange={(e) =>
                    update({
                      status:
                        e.target.value
                    })
                  }
                >
                  <option>
                    Open
                  </option>

                  <option>
                    In Progress
                  </option>

                  <option>
                    Resolved
                  </option>

                  <option>
                    Closed
                  </option>
                </select>
              </label>

              <label>
                Priority

                <select
                  value={t.priority}
                  onChange={(e) =>
                    update({
                      priority:
                        e.target.value
                    })
                  }
                >
                  <option>
                    Low
                  </option>

                  <option>
                    Medium
                  </option>

                  <option>
                    High
                  </option>

                  <option>
                    Urgent
                  </option>
                </select>
              </label>

              <label>
                Assigned agent

                <select
                  value={
                    t.assignedTo?._id ||
                    ""
                  }
                  onChange={(e) =>
                    update({
                      assignedTo:
                        e.target.value ||
                        null
                    })
                  }
                >
                  <option value="">
                    Unassigned
                  </option>

                  {agents.map(
                    (a) => (
                      <option
                        key={
                          a._id
                        }
                        value={
                          a._id
                        }
                      >
                        {a.name}
                      </option>
                    )
                  )}
                </select>
              </label>
            </>
          ) : (
            <label>
              Ticket status

              <select
                value={t.status}
                onChange={(e) =>
                  update({
                    status:
                      e.target.value
                  })
                }
              >
                <option>
                  Open
                </option>

                <option>
                  Closed
                </option>
              </select>
            </label>
          )}

          <div className="meta-list">
            <div>
              <span>
                Category
              </span>

              <b>
                {t.category?.name}
              </b>
            </div>

            <div>
              <span>
                Created by
              </span>

              <b>
                {t.createdBy?.name}
              </b>
            </div>

            <div>
              <span>
                Assigned to
              </span>

              <b>
                {t.assignedTo?.name ||
                  "Unassigned"}
              </b>
            </div>

            {t.resolvedAt && (
              <div>
                <span>
                  Resolved
                </span>

                <b>
                  {new Date(
                    t.resolvedAt
                  ).toLocaleDateString()}
                </b>
              </div>
            )}
          </div>
        </aside>
      </div>

      {previewImage && (
        <div
          className="image-preview-overlay"
          onClick={() =>
            setPreviewImage(null)
          }
        >
          <button
            type="button"
            className="image-preview-close"
            onClick={() =>
              setPreviewImage(null)
            }
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>

          <img
            src={previewImage}
            alt="Preview"
            className="image-preview-image"
            onClick={(e) =>
              e.stopPropagation()
            }
          />
        </div>
      )}
    </div>
  );
}

export default TicketDetails;