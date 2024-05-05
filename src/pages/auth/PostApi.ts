/**
 * Common function to make POST requests to a specified URL with given data.
 * @param {string} url - The URL to which the POST request is sent.
 * @param {object} data - The payload for the POST request.
 * @returns {Promise<any>} - The promise that resolves to the response data.
 */
async function postAPI(url: string, data: object) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();

        if (responseData.error) {
            throw new Error(responseData.error);
        }

        return responseData;
    } catch (error) {
        console.error('Error making POST request:', error.stack);
        throw error;
    }
}

export default postAPI;
