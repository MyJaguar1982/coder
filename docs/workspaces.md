# Workspaces

Workspaces contain the IDEs, dependencies, and configuration information needed
for software development.

## Create workspaces

Each Coder user has their own workspaces created from [shared
templates](./templates.md):

```sh
# create a workspace from the template; specify any variables
coder create <workspace-name>

# show the resources behind the workspace and how to connect
coder show <workspace-name>
```

## Connect with SSH

Once you've added your workspaces to your SSH hosts, you can connect from any
IDE with remote development support:

```sh
coder config-ssh
coder ssh <workspaceName>
```

## Editors and IDEs

The following desktop IDEs have been tested with Coder, though any IDE with SSH
support should work!

- VS Code (with [Remote -
  SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)
  extension)
- JetBrains (with
  [Gateway](https://www.jetbrains.com/help/idea/remote-development-a.html#launch_gateway)
  installed)
  - IntelliJ IDEA
  - CLion
  - GoLand
  - PyCharm
  - Rider
  - RubyMine
  - WebStorm

## Workspace lifecycle

Workspaces in Coder are started and stopped, often based on whether there was
any activity or if there was a [template
update](./templates.md#manage-templates) available.

Resources are often destroyed and re-created when a workspace is restarted,
though the exact behavior depends on the template's definitions. For more
information, see [persistent and ephemeral
resources](./templates.md#persistent-and-ephemeral-resources).

> ⚠️ To avoid data loss, refer to your template documentation for information on
> where to store files, install software, etc., so that they persist. Default
> templates are documented in [../examples/templates](../examples/templates/).
>
> You can use `coder show <workspace-name>` to see which resources are
> persistent and which are ephemeral.

When a workspace is deleted, all of the workspace's resources are deleted.

## Dotfiles

Users can install configuration from a personal [dotfiles repository](https://dotfiles.github.io) with the `coder dotfiles <repo>`
command in their workspace. Templates can also prompt users for their dotfiles repo [(example)](../examples/templates/docker-with-dotfiles/README.md#how-it-works).

## Updating workspaces

Use the following command to update a workspace to the latest template version.
The workspace will be stopped and started:

```sh
coder update <workspace-name>
```
