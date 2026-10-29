import {
  boolean,
  customType,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** Binary column used to store uploaded documents directly in PostgreSQL. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** Empresas assessoradas pelo escritório. */
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  legalName: text("legal_name").notNull(),
  tradeName: text("trade_name").notNull(),
  cnpj: text("cnpj").notNull(),
  regime: text("regime").notNull(),
  segment: text("segment").notNull(),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  employees: integer("employees").notNull().default(0),
  clientSince: integer("client_since").notNull(),
  createdAt: createdAt(),
});

/** Usuários do portal: clientes (vinculados a uma empresa) e equipe interna. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

/** Arquivos trocados entre cliente e escritório. */
export const files = pgTable(
  "files",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    data: bytea("data").notNull(),
    uploadedBy: text("uploaded_by").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("files_client_idx").on(t.clientId)],
);

/** Checklist mensal de documentos que o cliente precisa entregar. */
export const documentRequests = pgTable(
  "document_requests",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    competence: text("competence").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    status: text("status").notNull().default("pendente"),
    fileId: integer("file_id").references(() => files.id, { onDelete: "set null" }),
    note: text("note"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("document_requests_client_idx").on(t.clientId, t.competence)],
);

/** Guias, balancetes e relatórios disponibilizados pelo escritório. */
export const deliverables = pgTable(
  "deliverables",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    competence: text("competence").notNull(),
    dueDate: date("due_date", { mode: "string" }),
    amountCents: integer("amount_cents"),
    status: text("status").notNull().default("disponivel"),
    fileId: integer("file_id").references(() => files.id, { onDelete: "set null" }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("deliverables_client_idx").on(t.clientId)],
);

/** Solicitações / protocolos abertos pelos clientes. */
export const tickets = pgTable(
  "tickets",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull().default("aberta"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tickets_client_idx").on(t.clientId)],
);

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: serial("id").primaryKey(),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("ticket_messages_ticket_idx").on(t.ticketId)],
);

/** Monitor de certidões negativas (CND, CRF, CNDT...). */
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  expiresAt: date("expires_at", { mode: "string" }).notNull(),
  irregular: boolean("irregular").notNull().default(false),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Avisos publicados no portal (clientId nulo = todos os clientes). */
export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: createdAt(),
});

/** Registro de cobranças de documentos (WhatsApp) feitas pela equipe. */
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  competence: text("competence").notNull(),
  channel: text("channel").notNull().default("whatsapp"),
  message: text("message").notNull(),
  createdAt: createdAt(),
});

/** Leads captados pelo formulário do site. */
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  message: text("message"),
  sourcePage: text("source_page"),
  status: text("status").notNull().default("novo"),
  createdAt: createdAt(),
});

export type Client = typeof clients.$inferSelect;
export type Lead = typeof leads.$inferSelect;
