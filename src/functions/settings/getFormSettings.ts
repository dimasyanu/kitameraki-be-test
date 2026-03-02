import { HttpRequest, InvocationContext, HttpResponseInit } from "@azure/functions";
import { ok } from "../../utils/response";

export const getFormSettings = async (
    request: HttpRequest,
    context: InvocationContext,
): Promise<HttpResponseInit> => {
    return ok(null)
}
