import { makeStyles, Theme } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import useTheme from "@material-ui/styles/useTheme"
import { FC } from "react"
import { Workspace, WorkspaceResource } from "../../api/typesGenerated"
import { getDisplayAgentStatus } from "../../util/workspace"
import { AppLink } from "../AppLink/AppLink"
import {
  HelpTooltip,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "../HelpTooltip/HelpTooltip"
import { Stack } from "../Stack/Stack"
import { TableHeaderRow } from "../TableHeaders/TableHeaders"
import { TerminalLink } from "../TerminalLink/TerminalLink"
import { WorkspaceSection } from "../WorkspaceSection/WorkspaceSection"

const Language = {
  resources: "Resources",
  resourceLabel: "Resource",
  agentsLabel: "Agents",
  agentLabel: "Agent",
  statusLabel: "Status",
  accessLabel: "Access",
  resourceTooltipTitle: "What is a resource?",
  resourceTooltipText: "A resource is an infrastructure object that is create when the workspace is provisioned.",
  resourceTooltipLink: "Persistent and ephemeral resources",
  agentTooltipTitle: "What is an agent?",
  agentTooltipText:
    "The Coder agent runs inside your resource and gives you direct access to the shell via the UI or CLI.",
}

const ResourcesHelpTooltip: React.FC = () => {
  return (
    <HelpTooltip size="small">
      <HelpTooltipTitle>{Language.resourceTooltipTitle}</HelpTooltipTitle>
      <HelpTooltipText>{Language.resourceTooltipText}</HelpTooltipText>
      <HelpTooltipLinksGroup>
        <HelpTooltipLink href="https://github.com/coder/coder/blob/main/docs/templates.md#persistent-and-ephemeral-resources">
          {Language.resourceTooltipLink}
        </HelpTooltipLink>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  )
}

const AgentHelpTooltip: React.FC = () => {
  return (
    <HelpTooltip size="small">
      <HelpTooltipTitle>{Language.agentTooltipTitle}</HelpTooltipTitle>
      <HelpTooltipText>{Language.agentTooltipText}</HelpTooltipText>
    </HelpTooltip>
  )
}

interface ResourcesProps {
  resources?: WorkspaceResource[]
  getResourcesError?: Error
  workspace: Workspace
  canUpdateWorkspace: boolean
}

export const Resources: FC<ResourcesProps> = ({ resources, getResourcesError, workspace, canUpdateWorkspace }) => {
  const styles = useStyles()
  const theme: Theme = useTheme()

  return (
    <WorkspaceSection title={Language.resources} contentsProps={{ className: styles.sectionContents }}>
      {getResourcesError ? (
        { getResourcesError }
      ) : (
        <Table className={styles.table}>
          <TableHead>
            <TableHeaderRow>
              <TableCell>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {Language.resourceLabel}
                  <ResourcesHelpTooltip />
                </Stack>
              </TableCell>
              <TableCell className={styles.agentColumn}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {Language.agentLabel}
                  <AgentHelpTooltip />
                </Stack>
              </TableCell>
              {canUpdateWorkspace && <TableCell>{Language.accessLabel}</TableCell>}
              <TableCell>{Language.statusLabel}</TableCell>
            </TableHeaderRow>
          </TableHead>
          <TableBody>
            {resources?.map((resource) => {
              {
                /* We need to initialize the agents to display the resource */
              }
              const agents = resource.agents ?? [null]
              return agents.map((agent, agentIndex) => {
                {
                  /* If there is no agent, just display the resource name */
                }
                if (!agent) {
                  return (
                    <TableRow key={`${resource.id}-${agentIndex}`}>
                      <TableCell className={styles.resourceNameCell}>
                        {resource.name}
                        <span className={styles.resourceType}>{resource.type}</span>
                      </TableCell>
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  )
                }

                return (
                  <TableRow key={`${resource.id}-${agent.id}`}>
                    {/* We only want to display the name in the first row because we are using rowSpan */}
                    {/* The rowspan should be the same than the number of agents */}
                    {agentIndex === 0 && (
                      <TableCell className={styles.resourceNameCell} rowSpan={agents.length}>
                        {resource.name}
                        <span className={styles.resourceType}>{resource.type}</span>
                      </TableCell>
                    )}

                    <TableCell className={styles.agentColumn}>
                      {agent.name}
                      <span className={styles.operatingSystem}>{agent.operating_system}</span>
                    </TableCell>
                    {canUpdateWorkspace && (
                      <TableCell>
                        <Stack>
                          {agent.status === "connected" && (
                            <TerminalLink
                              className={styles.accessLink}
                              workspaceName={workspace.name}
                              agentName={agent.name}
                              userName={workspace.owner_name}
                            />
                          )}
                          {agent.status === "connected" &&
                            agent.apps.map((app) => (
                              <AppLink
                                key={app.name}
                                appIcon={app.icon}
                                appName={app.name}
                                userName={workspace.owner_name}
                                workspaceName={workspace.name}
                              />
                            ))}
                        </Stack>
                      </TableCell>
                    )}
                    <TableCell>
                      <span style={{ color: getDisplayAgentStatus(theme, agent).color }}>
                        {getDisplayAgentStatus(theme, agent).status}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            })}
          </TableBody>
        </Table>
      )}
    </WorkspaceSection>
  )
}

const useStyles = makeStyles((theme) => ({
  sectionContents: {
    margin: 0,
  },

  table: {
    border: 0,
  },

  resourceNameCell: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },

  resourceType: {
    fontSize: 14,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    display: "block",
  },

  // Adds some left spacing
  agentColumn: {
    paddingLeft: `${theme.spacing(2)}px !important`,
  },

  accessLink: {
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",

    "& svg": {
      width: 16,
      height: 16,
      marginRight: theme.spacing(1.5),
    },
  },

  operatingSystem: {
    fontSize: 14,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    display: "block",
    textTransform: "capitalize",
  },
}))
