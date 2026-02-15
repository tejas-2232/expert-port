---
title: "Ansible tips for cloud automation"
description: "Intro to Ansible, its architecture, useful commands, and practical tips for playbooks that run reliably in CI and on hundreds of hosts."
pubDate: 2024-10-15
---

## What is Ansible?

**Ansible** is an open-source automation platform for configuration management, application deployment, and task automation. It uses a simple, human-readable language (YAML) and requires no agents on target hosts—it connects over SSH (Linux/Unix) or WinRM (Windows), so you don’t install extra software on managed machines. Ansible is idempotent by design: running the same playbook multiple times leaves the system in the same desired state.

## Ansible architecture

- **Control node** – The machine where you run Ansible (your laptop or a CI runner). Only the control node needs Ansible installed.
- **Managed nodes** – The servers or devices you configure. They only need SSH (or WinRM) and Python; no Ansible agent.
- **Inventory** – A list of managed hosts, often grouped (e.g. `webservers`, `db`, `staging`, `prod`). Can be a static file (`hosts`, `inventory.yml`) or dynamic (e.g. from cloud APIs).
- **Playbooks** – YAML files that define plays (which hosts) and tasks (what to run). Tasks call **modules** (e.g. `apt`, `copy`, `service`, `template`).
- **Modules** – Reusable units that do one thing (install a package, copy a file, start a service). Ansible ships with hundreds; you can write custom ones.
- **Roles** – Bundles of tasks, vars, handlers, and templates that you reuse across playbooks (e.g. “nginx”, “app-deploy”).
- **Handlers** – Tasks that run only when notified (e.g. “restart nginx” after a config change).

Data flow: you run a playbook from the control node → Ansible connects to hosts in the inventory → runs modules on the targets → reports back. All communication is push-based from the control node.

## Useful Ansible commands

**Ad-hoc (one-off tasks):**
```bash
# Ping all hosts
ansible all -m ping

# Run a shell command on a group
ansible webservers -m shell -a "uptime"

# Copy a file to hosts
ansible all -m copy -a "src=/local/file dest=/remote/file"

# Install a package (Ubuntu/Debian)
ansible app -m apt -a "name=nginx state=present update_cache=yes" --become

# Restart a service
ansible webservers -m service -a "name=nginx state=restarted" --become
```

**Playbooks:**
```bash
# Run a playbook
ansible-playbook site.yml

# Run with a specific inventory file
ansible-playbook deploy.yml -i production

# Limit to certain hosts
ansible-playbook site.yml --limit webservers

# Run only tasks with a tag
ansible-playbook site.yml --tags "config"

# Dry run (check mode)
ansible-playbook site.yml --check --diff

# Verbose output for debugging
ansible-playbook site.yml -vv
```

**Inventory and info:**
```bash
# List hosts in inventory
ansible all --list-hosts

# Show variables for a host
ansible hostname -m debug -a "var=hostvars[inventory_hostname]"

# Test connectivity
ansible all -m ping
```

## Idempotency

Every task should be safe to run multiple times. Use `state: present` (or absent), avoid raw shell when a module exists, and guard destructive steps with `when` or `--check` runs first.

## Handlers and tags

Use **handlers** for “restart service” / “reload config” so they run once at the end. Use **tags** so you can run only “config” or “deploy” without re-running the whole playbook.

## Inventories and groups

Keep staging and prod in the same inventory file with different groups. Use group_vars and host_vars so secrets and env-specific values stay out of the playbook code.

## Quick win

Run with `-v` or `-vv` when debugging; use `--check --diff` to see what would change before applying.
