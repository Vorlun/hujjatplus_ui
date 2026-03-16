import { apiClient } from "../services/apiClient";

export interface MessagePayload {
  id: string;
  request_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
}

export async function sendMessage(
  requestId: string,
  message: string,
  userId: string
): Promise<MessagePayload> {
  return apiClient<MessagePayload>(`/requests/${encodeURIComponent(requestId)}/messages`, {
    method: "POST",
    body: JSON.stringify({
      sender_id: userId,
      message_text: message,
    }),
  });
}

export async function fetchMessages(requestId: string): Promise<MessagePayload[]> {
  return apiClient<MessagePayload[]>(`/requests/${encodeURIComponent(requestId)}/messages`);
}

