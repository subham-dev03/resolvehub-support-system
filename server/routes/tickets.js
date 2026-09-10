import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Ticket from "../models/Ticket.js";
import { protect, allow } from "../middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const safeName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .substring(0, 80);

    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}${extension}`;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,

  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024
  }
});

function visibleFilter(user) {
  if (user.role === "customer") {
    return {
      createdBy: user._id
    };
  }

  if (user.role === "agent") {
    return {
      $or: [
        { assignedTo: user._id },
        { assignedTo: null }
      ]
    };
  }

  return {};
}

router.get("/stats", protect, async (req, res) => {
  try {
    const filter = visibleFilter(req.user);

    const [
      total,
      open,
      progress,
      resolved,
      closed,
      urgent
    ] = await Promise.all([
      Ticket.countDocuments(filter),

      Ticket.countDocuments({
        ...filter,
        status: "Open"
      }),

      Ticket.countDocuments({
        ...filter,
        status: "In Progress"
      }),

      Ticket.countDocuments({
        ...filter,
        status: "Resolved"
      }),

      Ticket.countDocuments({
        ...filter,
        status: "Closed"
      }),

      Ticket.countDocuments({
        ...filter,
        priority: "Urgent"
      })
    ]);

    res.json({
      total,
      open,
      progress,
      resolved,
      closed,
      urgent
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load ticket statistics"
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const filter = {
      ...visibleFilter(req.user)
    };

    if (
      req.query.status &&
      req.query.status !== "All"
    ) {
      filter.status = req.query.status;
    }

    if (
      req.query.priority &&
      req.query.priority !== "All"
    ) {
      filter.priority = req.query.priority;
    }

    if (req.query.search) {
      filter.$and = [
        {
          $or: [
            {
              title: {
                $regex: req.query.search,
                $options: "i"
              }
            },
            {
              description: {
                $regex: req.query.search,
                $options: "i"
              }
            }
          ]
        }
      ];
    }

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = 10;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "assignedTo",
          "name email"
        )
        .populate(
          "category",
          "name"
        )
        .sort({
          updatedAt: -1
        })
        .skip((page - 1) * limit)
        .limit(limit),

      Ticket.countDocuments(filter)
    ]);

    res.json({
      tickets,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load tickets"
    });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(
      req.params.id
    )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "assignedTo",
        "name email"
      )
      .populate(
        "category",
        "name"
      )
      .populate(
        "comments.user",
        "name role"
      )
      .populate(
        "activity.by",
        "name role"
      );

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isOwner =
      String(ticket.createdBy._id) ===
      String(req.user._id);

    const isAssigned =
      ticket.assignedTo &&
      String(ticket.assignedTo._id) ===
        String(req.user._id);

    const isUnassignedAgent =
      req.user.role === "agent" &&
      !ticket.assignedTo;

    if (
      !isAdmin &&
      !isOwner &&
      !isAssigned &&
      !isUnassignedAgent
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load ticket"
    });
  }
});

router.post(
  "/",
  protect,
  allow("customer"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        priority
      } = req.body;

      const ticket = new Ticket({
        title,
        description,
        category,
        priority,
        createdBy: req.user._id
      });

      ticket.activity.push({
        action: "Ticket created",
        by: req.user._id
      });

      await ticket.save();

      const createdTicket =
        await Ticket.findById(ticket._id)
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "category",
            "name"
          )
          .populate(
            "activity.by",
            "name email role"
          );

      res.status(201).json(
        createdTicket
      );
    } catch (error) {
      console.error(error);

      res.status(400).json({
        message: error.message
      });
    }
  }
);

router.patch("/:id", protect, async (req, res) => {
  try {
    const ticket =
      await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const isOwner =
      String(ticket.createdBy) ===
      String(req.user._id);

    const isAssigned =
      ticket.assignedTo &&
      String(ticket.assignedTo) ===
        String(req.user._id);

    const isAdmin =
      req.user.role === "admin";

    const isUnassignedAgent =
      req.user.role === "agent" &&
      !ticket.assignedTo;

    if (req.user.role === "customer") {
      if (!isOwner) {
        return res.status(403).json({
          message: "Access denied"
        });
      }

      if (
        req.body.status &&
        !["Closed", "Open"].includes(
          req.body.status
        )
      ) {
        return res.status(403).json({
          message:
            "Customers can only open or close tickets"
        });
      }

      ticket.status =
        req.body.status ||
        ticket.status;
    } else {
      if (
        !isAdmin &&
        !isAssigned &&
        !isUnassignedAgent
      ) {
        return res.status(403).json({
          message:
            "Only assigned agents, unassigned agents, or admin can update this ticket"
        });
      }

      if (req.body.status !== undefined) {
        ticket.status =
          req.body.status;
      }

      if (req.body.priority !== undefined) {
        ticket.priority =
          req.body.priority;
      }

      if (req.body.assignedTo !== undefined) {
        ticket.assignedTo =
          req.body.assignedTo || null;
      }

      if (
        req.user.role === "agent" &&
        !ticket.assignedTo
      ) {
        ticket.assignedTo =
          req.user._id;
      }

      if (
        req.body.status === "Resolved"
      ) {
        ticket.resolvedAt =
          new Date();
      }

      if (
        req.body.status === "Open" ||
        req.body.status === "In Progress"
      ) {
        ticket.resolvedAt = null;
      }
    }

    const changedFields =
      Object.keys(req.body);

    ticket.activity.push({
      action: `Ticket updated: ${changedFields.join(
        ", "
      )}`,
      by: req.user._id
    });

    await ticket.save();

    const updatedTicket =
      await Ticket.findById(ticket._id)
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "assignedTo",
          "name email"
        )
        .populate(
          "category",
          "name"
        );

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: error.message
    });
  }
});

router.post(
  "/:id/comments",
  protect,
  upload.array("attachments", 10),
  async (req, res) => {
    try {
      const ticket =
        await Ticket.findById(req.params.id);

      if (!ticket) {
        if (req.files?.length) {
          req.files.forEach((file) => {
            fs.unlinkSync(file.path);
          });
        }

        return res.status(404).json({
          message: "Ticket not found"
        });
      }

      const isAdmin =
        req.user.role === "admin";

      const isOwner =
        String(ticket.createdBy) ===
        String(req.user._id);

      const isAssigned =
        ticket.assignedTo &&
        String(ticket.assignedTo) ===
          String(req.user._id);

      const isUnassignedAgent =
        req.user.role === "agent" &&
        !ticket.assignedTo;

      if (
        !isAdmin &&
        !isOwner &&
        !isAssigned &&
        !isUnassignedAgent
      ) {
        if (req.files?.length) {
          req.files.forEach((file) => {
            fs.unlinkSync(file.path);
          });
        }

        return res.status(403).json({
          message: "Access denied"
        });
      }

      const message =
        req.body.message?.trim() || "";

      const attachments =
        (req.files || []).map((file) => ({
          name: file.originalname,
          url: `/uploads/${file.filename}`,
          type: file.mimetype,
          size: file.size
        }));

      if (
        !message &&
        attachments.length === 0
      ) {
        return res.status(400).json({
          message:
            "Message or attachment is required"
        });
      }

      if (
        req.user.role === "agent" &&
        !ticket.assignedTo
      ) {
        ticket.assignedTo =
          req.user._id;

        ticket.activity.push({
          action:
            "Ticket automatically assigned to agent",
          by: req.user._id
        });
      }

      ticket.comments.push({
        user: req.user._id,
        message,
        attachments
      });

      ticket.activity.push({
        action:
          "Replied to ticket",
        by: req.user._id
      });

      await ticket.save();

      const updatedTicket =
        await Ticket.findById(ticket._id)
          .populate(
            "comments.user",
            "name role"
          );

      res.status(201).json(
        updatedTicket
      );
    } catch (error) {
      console.error(error);

      if (req.files?.length) {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch {}
        });
      }

      res.status(500).json({
        message:
          error.message ||
          "Failed to add reply"
      });
    }
  }
);

router.delete(
  "/:id",
  protect,
  allow("admin"),
  async (req, res) => {
    try {
      await Ticket.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message: "Ticket deleted"
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to delete ticket"
      });
    }
  }
);

export default router;