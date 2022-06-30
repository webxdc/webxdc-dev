export const scrollToDevice = (instanceId: string) => {
  document.getElementById("instance-" + instanceId)?.scrollIntoView();
};
