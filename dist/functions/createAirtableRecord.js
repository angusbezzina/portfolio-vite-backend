"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAirtableRecord = void 0;
const airtable_1 = __importDefault(require("airtable"));
const createAirtableRecord = async (event, _context) => {
    const AIRTABLE = {
        API_KEY: process.env.AIRTABLE_API_KEY || "",
        BASE: process.env.AIRTABLE_BASE || "",
        TABLE: process.env.AIRTABLE_TABLE || "",
    };
    const base = new airtable_1.default({ apiKey: AIRTABLE.API_KEY }).base(AIRTABLE.BASE);
    const { body } = event;
    const response = JSON.parse(body !== null && body !== void 0 ? body : "");
    const { name, email, message, language } = response;
    const headers = {
        "access-control-allow-methods": "OPTIONS,POST",
        "access-control-allow-origin": "*",
        "content-type": "application/json",
    };
    try {
        await base(AIRTABLE.TABLE).create({
            Email: email,
            Message: message,
            Name: name,
            Language: language,
        });
        return {
            statusCode: 200,
            body: JSON.stringify({
                body: JSON.stringify({ success: true }),
                headers: headers,
            }),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false }),
            headers: headers,
        };
    }
};
exports.createAirtableRecord = createAirtableRecord;
