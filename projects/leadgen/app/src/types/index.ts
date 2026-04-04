export type {
  User,
  Company,
  Lead,
  Activity,
  Sequence,
  SequenceStep,
  SequenceEnrollment,
  Template,
  Alert,
} from "@/generated/prisma/client";

// Import enums from the dedicated enums file (safe for client bundles)
export {
  Role,
  CompanySize,
  Stage,
  ActivityType,
  Channel,
  EnrollmentStatus,
} from "@/generated/prisma/enums";
