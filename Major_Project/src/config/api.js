const services = {
  rag: import.meta.env.VITE_RAG_API_URL || 'http://localhost:5001',
  mandira: import.meta.env.VITE_MANDIRA_API_URL || 'http://localhost:5000',
};

export async function askAhara(query) {
  const response = await fetch(`${services.rag}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'The Ahara knowledge service is unavailable.');
  }

  return data;
}

export function mandiraApi(path) {
  return `${services.mandira}/api/mandira${path}`;
}

export function userApi(path) {
  return `${services.mandira}/api/user${path}`;
}