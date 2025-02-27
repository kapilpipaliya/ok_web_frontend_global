import type { Session } from "neo4j-driver";

import { createAppState } from "~/createAppState";
import { mutateData } from "~/cypher/mutate/mutation_handlers/mutateData";
import { APIError } from "~/lib/api/apiErrorHandler";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { accountDeletionForm } from "~/routes/internal/page/(email)/(templates)/(account)/accountDeletionSchema";
import { twoFactorAuthForm } from "~/routes/internal/page/(email)/(templates)/(auth)/twoFactorAuthSchema";
import { verificationCodeForm } from "~/routes/internal/page/(email)/(templates)/(auth)/verificationCodeSchema";
import { testEmailForm } from "~/routes/internal/page/(email)/(templates)/(other)/testEmailSchema";
import { emailChangedForm } from "~/routes/internal/page/(email)/(templates)/(profile)/emailChangedSchema";
import { emailChangeSuccessfulForm } from "~/routes/internal/page/(email)/(templates)/(profile)/emailChangeSuccessfulSchema";
import { emailConfirmationForm } from "~/routes/internal/page/(email)/(templates)/(profile)/emailConfirmationSchema";
import { passwordChangedForm } from "~/routes/internal/page/(email)/(templates)/(profile)/passwordChangedSchema";
import { profileUpdatedForm } from "~/routes/internal/page/(email)/(templates)/(profile)/profileUpdatedSchema";
import { signupConfirmationForm } from "~/routes/internal/page/(email)/(templates)/(signup)/signupConfirmationSchema";
import { welcomeEmailForm } from "~/routes/internal/page/(email)/(templates)/(signup)/welcomeEmailSchema";
import { invitationEmailForm } from "~/routes/internal/page/(email)/(templates)/(user)/invitationEmailSchema";

const EMAIL_TEMPLATES = {
  AccountDeletion: accountDeletionForm,
  EmailChanged: emailChangedForm,
  EmailChangeSuccessful: emailChangeSuccessfulForm,
  EmailConfirmation: emailConfirmationForm,
  InvitationEmail: invitationEmailForm,
  PasswordChanged: passwordChangedForm,
  ProfileUpdated: profileUpdatedForm,
  SignupConfirmation: signupConfirmationForm,
  TestEmail: testEmailForm,
  TwoFactorAuth: twoFactorAuthForm,
  VerificationCode: verificationCodeForm,
  WelcomeEmail: welcomeEmailForm,
} as const;

export function getEmailTemplateSchema(templateName: string) {
  return EMAIL_TEMPLATES[templateName as keyof typeof EMAIL_TEMPLATES];
}

export async function saveAllEmailTemplates(dbSession: Session) {
  const tx = dbSession.beginTransaction();
  try {
    for (const [templateName, schema] of Object.entries(EMAIL_TEMPLATES)) {
      const [graph, setGraph] = createAppState();
      const txnId = generateNewTxnId(graph, setGraph);

      const { error } = createMeta(
        schema,
        txnId,
        graph,
        setGraph,
        "EmailTemplate",
      );
      if (error) {
        throw new APIError(`Failed to create meta for ${templateName}`, 500);
      }

      const commitData = commitTxn(txnId, graph);
      if (!commitData) {
        throw new APIError(`Failed to upload ${templateName} template`, 500);
      }

      await mutateData(commitData, tx);
    }

    await tx.commit();
    return { success: true };
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}
