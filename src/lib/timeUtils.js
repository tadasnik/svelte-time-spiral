export function addYear(dateToIncrement) {
  let incrementedDate = new Date(dateToIncrement);
  return incrementedDate.setFullYear(incrementedDate.getFullYear() + 1);
}
export function substractYear(dateToIncrement) {
  let incrementedDate = new Date(dateToIncrement);
  return incrementedDate.setFullYear(incrementedDate.getFullYear() - 1);
}

