# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1   | No        |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report them privately via
[GitHub Security Advisories](https://github.com/mantisdarling/Techfest-IITB-Parallax/security/advisories/new)
("Report a vulnerability" button on the Security tab).

Include:

- A description of the vulnerability and its impact
- Steps to reproduce (proof-of-concept if possible)
- Affected versions / commit hashes

You can expect an acknowledgement within 7 days. Once a fix is ready, a new
release will be published and the advisory disclosed.

## Scope

This is a client-side WebGL experience with no backend or authentication. The
application does not collect personal data, and fonts are served from the same
origin. A hosting provider may still process standard request metadata such as
IP addresses. Reports about dependency vulnerabilities are welcome; Dependabot
and CodeQL run automatically on this repository.
