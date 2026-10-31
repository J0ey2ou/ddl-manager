CREATE TABLE tenants(id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, disabled INTEGER NOT NULL DEFAULT 0);
CREATE TABLE messages(
 tenant TEXT NOT NULL REFERENCES tenants(id), day TEXT NOT NULL, id TEXT NOT NULL,
 hash TEXT NOT NULL, due INTEGER NOT NULL, expires INTEGER NOT NULL, status TEXT NOT NULL,
 encrypted TEXT, updated INTEGER NOT NULL, provider_id TEXT,
 PRIMARY KEY(tenant,day), UNIQUE(tenant,id));
CREATE INDEX pending_due ON messages(status,due);
CREATE TABLE request_limits(tenant TEXT NOT NULL, hour INTEGER NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(tenant,hour));
