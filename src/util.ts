export default function makeRequest(
    method: string,
    url: string,
    responseType: XMLHttpRequestResponseType,
): Promise<unknown> {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.responseType = responseType;
        xhr.onload = function (): void {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                alert("Could not load model - please ensure data is present in the 'dist' folder.");
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function (): void {
            alert("Could not load model - please ensure data is present in the 'dist' folder.");
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}