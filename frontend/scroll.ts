export const scrollToDevice = (instanceId: string) => {
  document.getElementById("device-" + instanceId)?.scrollIntoView();
};

export const scrollToLastMessage = () => {
  document.querySelector("#messages > tbody > tr:last-child")?.scrollIntoView();
};
