import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function solveCaptcha() {
  const input = await screen.findByRole("spinbutton", {
    name: /What is \d+ \+ \d+\?/,
  });
  const name = input.getAttribute("id");
  const label =
    document.querySelector(`label[for="${name}"]`)?.textContent || "";
  const numbers = label.match(/\d+/g)?.map(Number);
  if (!numbers || numbers.length !== 2)
    throw new Error("Missing addition question");
  await userEvent.clear(input);
  await userEvent.type(input, String(numbers[0] + numbers[1]));
}
