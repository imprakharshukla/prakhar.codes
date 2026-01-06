import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const emergencyContactInputSchema = z.object({
  incidentDescription: z
    .string()
    .describe(
      "Brief description of the incident to determine if department supervisors need to be alerted"
    ),
  severity: z
    .enum(["low", "medium", "high", "critical"])
    .optional()
    .describe("Severity level if already assessed"),
});

export const emergencyContactOutputSchema = z.object({
  contacted: z
    .boolean()
    .describe("Whether department supervisors were alerted"),
  serviceType: z
    .enum(["ambulance", "fire department", "police", "none"])
    .describe("Type of department supervisor to alert"),
  emergencyType: z
    .string()
    .describe(
      "Type of emergency identified (e.g., 'Medical emergency - injury', 'Fire hazard', 'Criminal activity')"
    ),
  contactMessage: z
    .string()
    .describe(
      "Demo message showing what was communicated to department supervisors"
    ),
  timestamp: z
    .string()
    .describe("Timestamp when department supervisors were alerted"),
  incidentId: z
    .string()
    .describe("Unique identifier for this supervisor alert"),
});

export const emergencyContactTool = createTool({
  id: "emergency_contact",
  description:
    "Alert department supervisors if the incident requires immediate attention, involves fire, or is life-threatening. Use this tool immediately when you detect critical incidents, injuries requiring medical attention, or life-threatening situations.",
  inputSchema: emergencyContactInputSchema,
  outputSchema: emergencyContactOutputSchema,
  execute: async ({ context }) => {
    const { incidentDescription, severity } = context;

    // Use LLM to analyze the incident and determine if department supervisors need to be alerted
    try {
      const { object } = await generateObject({
        model: openrouter("openai/gpt-4o-mini"),
        schema: z.object({
          needsEmergencyServices: z
            .boolean()
            .describe("Whether department supervisors need to be alerted"),
          serviceType: z
            .enum(["ambulance", "fire department", "police", "none"])
            .describe("Type of department supervisor to alert"),
          emergencyType: z.string().describe("Type of emergency identified"),
          contactMessage: z
            .string()
            .describe(
              "Demo message showing what would be communicated to department supervisors (in Norwegian). Include location, type of emergency, brief description, number of people involved/injured, and current status."
            ),
        }),
        prompt: `Analyze the following incident description and determine if department supervisors need to be alerted:

Incident: ${incidentDescription}
Severity: ${severity || "not specified"}

Determine:
1. Does this require alerting department supervisors? (injuries, fire, life-threatening situations, critical incidents)
2. Which department supervisor? (ambulance for medical emergencies, fire department for fires/smoke, police for crimes/violence, none if not needed)
3. What type of emergency is this? (e.g., "Medisinsk nødsituasjon - skade", "Brannfare", "Kriminell aktivitet")
4. Generate a realistic demo message (in Norwegian) that would be sent to department supervisors, including:
   - Location (if mentioned, otherwise use "på stedet")
   - Type of emergency
   - Brief description
   - Number of people involved/injured (if mentioned)
   - Current status

Example message format:
"Medisinsk nødsituasjon på [lokasjon]. [Beskrivelse]. [Antall personer] involvert. [Status]."

Return ONLY valid JSON matching the schema.`,
        temperature: 0.3,
      });

      if (!object.needsEmergencyServices || object.serviceType === "none") {
        return {
          contacted: false,
          serviceType: "none" as const,
          emergencyType: "Ingen nødsituasjon",
          contactMessage: "Ingen varsling av avdelingsledere påkrevd",
          timestamp: new Date().toISOString(),
          incidentId: `incident-${Date.now()}`,
        };
      }

      // Simulate alerting department supervisors (8 second delay)
      console.log(
        `[Emergency Contact] Alerting ${object.serviceType} department supervisor for ${object.emergencyType}`
      );
      console.log(`[Emergency Contact] Message: ${object.contactMessage}`);
      await new Promise((resolve) => setTimeout(resolve, 8000));
      console.log(
        `[Emergency Contact] Successfully alerted ${object.serviceType} department supervisor`
      );
      console.log(`[Emergency Contact] Report sent to leadership`);

      return {
        contacted: true,
        serviceType: object.serviceType,
        emergencyType: object.emergencyType,
        contactMessage: object.contactMessage,
        timestamp: new Date().toISOString(),
        incidentId: `incident-${Date.now()}`,
      };
    } catch (error) {
      console.error("[Emergency Contact Tool] Error:", error);
      // Fallback: determine based on keywords
      const needsEmergencyServices =
        severity === "critical" ||
        severity === "high" ||
        incidentDescription.toLowerCase().includes("injured") ||
        incidentDescription.toLowerCase().includes("hurt") ||
        incidentDescription.toLowerCase().includes("medical") ||
        incidentDescription.toLowerCase().includes("ambulance") ||
        incidentDescription.toLowerCase().includes("fire") ||
        incidentDescription.toLowerCase().includes("bleeding") ||
        incidentDescription.toLowerCase().includes("unconscious");

      if (!needsEmergencyServices) {
        return {
          contacted: false,
          serviceType: "none" as const,
          emergencyType: "Ingen nødsituasjon",
          contactMessage: "Ingen varsling av avdelingsledere påkrevd",
          timestamp: new Date().toISOString(),
          incidentId: `incident-${Date.now()}`,
        };
      }

      // Determine service type based on incident
      let serviceType: "ambulance" | "fire department" | "police" = "ambulance";
      let emergencyType = "Medisinsk nødsituasjon";
      const desc = incidentDescription.toLowerCase();
      if (desc.includes("fire") || desc.includes("smoke")) {
        serviceType = "fire department";
        emergencyType = "Brannfare";
      } else if (
        desc.includes("theft") ||
        desc.includes("crime") ||
        desc.includes("violence")
      ) {
        serviceType = "police";
        emergencyType = "Kriminell aktivitet";
      } else if (
        desc.includes("injured") ||
        desc.includes("hurt") ||
        desc.includes("medical")
      ) {
        serviceType = "ambulance";
        emergencyType = "Medisinsk nødsituasjon";
      }

      await new Promise((resolve) => setTimeout(resolve, 8000));
      console.log(`[Emergency Contact] Report sent to leadership`);

      return {
        contacted: true,
        serviceType,
        emergencyType,
        contactMessage: `Nødsituasjon på stedet. ${emergencyType} - ${incidentDescription}`,
        timestamp: new Date().toISOString(),
        incidentId: `incident-${Date.now()}`,
      };
    }
  },
});
