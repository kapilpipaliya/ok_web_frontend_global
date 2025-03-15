import { postAPI } from "~/lib/api/general/postApi";

// for mutate use handleDataSubmission function.

// Common function to handle API requests
export async function handleApiRequest(url: string,
  data: any,
  successMessage: string,
  setLoading: (value: boolean) => void,
  showSuccessToast: (message: string) => void,
  showErrorToast: (message: string) => void,
  onSuccess?: () => void,
  onError?: (error: any) => void) {
  try {
    setLoading(true);
    const response = await postAPI(url, data);
    if (response.error) {
      showErrorToast(response.error);
      onError && onError(response.error);
      return { success: false, response };
    } else {
      showSuccessToast(successMessage);
      onSuccess && onSuccess();
      return { success: true, response };
    }
  } catch (error) {
    showErrorToast((error as Error).message);
    onError && onError(error);
    return { success: false, error };
  } finally {
    setLoading(false);
  }
}
