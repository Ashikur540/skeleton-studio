# Security Policy

## Scope

Skeleton Studio is a **fully client-side** application. It has no backend, no
database, and no server-side secrets. All parsing, formatting, and code export
run in the user's browser. The only environment variables are `NEXT_PUBLIC_*`
values, which are public by design.

The most relevant security surface is the **JSX parsing pipeline** (`lib/parser`),
which processes untrusted pasted input. Reports about parser crashes, ReDoS, or
unexpected code execution from pasted input are especially welcome.

## Supported versions

The latest version on the `main` branch is supported. There are no backported
security releases.

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Instead, report privately via GitHub's
[private vulnerability reporting](https://github.com/Ashikur540/skeleton-studio/security/advisories/new)
(Security → Report a vulnerability).

Please include:

- A description of the issue and its impact.
- Steps to reproduce (a minimal pasted component that triggers it, if relevant).
- Any suggested fix.

We aim to acknowledge reports within a few days and will keep you updated on the
fix. Thanks for helping keep the project safe.
