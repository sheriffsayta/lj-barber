export function formaterNumeroClient(numeroClient: number)
{
  return `#ID${numeroClient.toString().padStart(5, "0")}`;
}
