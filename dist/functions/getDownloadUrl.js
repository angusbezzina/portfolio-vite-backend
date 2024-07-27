"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDownloadUrl = void 0;
const getDownloadUrl = async (event, _context) => {
    const { body } = event;
    const response = JSON.parse(body !== null && body !== void 0 ? body : "");
    const { url } = response;
    const headers = {
        "access-control-allow-methods": "OPTIONS,POST",
        "access-control-allow-origin": "*",
        "content-type": "application/json",
    };
    return {
        statusCode: 200,
        body: JSON.stringify({
            body: JSON.stringify({ url }),
            headers: headers,
        }),
    };
};
exports.getDownloadUrl = getDownloadUrl;
