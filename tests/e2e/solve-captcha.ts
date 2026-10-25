import { expect, type Locator } from "@playwright/test";

export async function solveMathCaptcha(form: Locator) {
  const group = form.getByRole("group", { name: "Quick check" });
  const input = group.getByRole("spinbutton");
  await expect(input).toBeEnabled();
  const question = await group.locator("label").innerText();
  const numbers = question.match(/\d+/g)?.map(Number);
  expect(numbers).toHaveLength(2);
  await input.fill(String(numbers![0] + numbers![1]));
}
