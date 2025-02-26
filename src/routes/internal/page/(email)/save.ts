import type { APIEvent } from "@solidjs/start/server";

import { getQuery } from "vinxi/http";

import { createAppState, createGraph } from "~/createAppState";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { mutateData } from "~/cypher/mutate/mutation_handlers/mutateData";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";

import { accountDeletionForm } from "./(templates)/(account)/accountDeletionSchema";
import { twoFactorAuthForm } from "./(templates)/(auth)/twoFactorAuthSchema";
import { verificationCodeForm } from "./(templates)/(auth)/verificationCodeSchema";
import { testEmailForm } from "./(templates)/(other)/testEmailSchema";
import { passwordChangedForm } from "./(templates)/(profile)/passwordChangedSchema";
import { profileUpdatedForm } from "./(templates)/(profile)/profileUpdatedSchema";
import { signupConfirmationForm } from "./(templates)/(signup)/signupConfirmationSchema";
import { welcomeEmailForm } from "./(templates)/(signup)/welcomeEmailSchema";

export default async function GET({ request }: APIEvent) {
  const query = getQuery();
  const templateName = query.templatename;
return "hi"
  if (!templateName) {
    throw new APIError("Template name is required", 400);
  }

  const { dbSession } = await getDBSessionForSubdomain(request);
  const tx = dbSession.beginTransaction();
  try {
    const emailTemplateSchema = await getEmailTemplateSchema(templateName as string);
    if (!emailTemplateSchema) {
      throw new APIError("Email template not found", 404);
    }

    const [graph, setGraph] = createAppState();
    
    const txnId = generateNewTxnId(graph, setGraph);
    const { error } = createMeta(emailTemplateSchema, txnId, graph, setGraph, "EmailTemplate");
    if (error) {
        throw new APIError("Failed to create meta", 500);
      }
    const commitData = commitTxn(txnId, graph);

    if (!commitData) {
      throw new APIError("Failed to upload Email Template", 500);
    }
    
    const res = await mutateData(commitData, tx);
    await tx.commit();
    return res;
  } catch (error) {
    await tx.rollback();
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

function getEmailTemplateSchema(templateName: string) {
  switch (templateName) {
    case "AccountDeletion":
      return accountDeletionForm;
    case "PasswordChanged":
      return passwordChangedForm;
    case "ProfileUpdated":
      return profileUpdatedForm;
    case "SignupConfirmation":
      return signupConfirmationForm;
    case "TestEmail":
      return testEmailForm;
    case "TwoFactorAuth":
      return twoFactorAuthForm;
    case "VerificationCode":
      return verificationCodeForm;
    case "WelcomeEmail":
      return welcomeEmailForm;
  }
}
