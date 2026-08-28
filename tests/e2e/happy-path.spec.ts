import { expect, test } from "@playwright/test";

test("completes the branch-to-receipt flow and revokes access", async ({ page }) => {
  await page.goto("/");
  const primary = page.getByTestId("primary-action");

  await expect(primary).toContainText("Ask agent for 3 branches");
  await primary.click();
  await expect(page.getByTestId("branch-balanced")).toBeVisible();
  await expect(primary).toContainText("Simulate 8 checks per branch");

  await primary.click();
  await expect(page.getByTestId("comparison-result")).toContainText("Balanced");
  await expect(page.getByTestId("branch-strict")).toContainText("2/3");
  await expect(page.getByTestId("branch-balanced")).toContainText("3/3");
  await expect(page.getByTestId("branch-broad")).toContainText("2/5");

  await primary.click();
  await expect(primary).toContainText("Agent previews activation");
  await primary.click();
  await expect(page.getByTestId("activation-preview")).toContainText("AFTER · 4 tools");
  await expect(primary).toContainText("Human approves exact preview");

  await primary.click();
  await expect(primary).toContainText("Agent commits approved policy");
  await primary.click();
  await expect(primary).toContainText("Run bounded refund");
  await expect(page.getByTestId("tool-surface")).toContainText("issue_refund");

  await primary.click();
  await expect(page.getByTestId("refund-record")).toContainText("USD 42.80 refunded");
  await expect(primary).toContainText("Generate verification receipt");

  await primary.click();
  await expect(page.getByTestId("verification-receipt")).toContainText("Outcome verified");
  await expect(page.getByTestId("verification-check")).toHaveCount(5);
  await expect(primary).toContainText("Human arms undo");
  await page.screenshot({ path: "test-results/permitbench-verified.png", fullPage: true });

  await primary.click();
  await expect(page.getByTestId("tool-surface")).toContainText("undo_policy_activation");
  await expect(primary).toContainText("Agent revokes access");
  await primary.click();

  await expect(page.getByTestId("active-policy-id")).toHaveText("pv_18");
  await expect(page.getByTestId("tool-surface")).not.toContainText("issue_refund");
  await expect(page.getByTestId("refund-record")).toHaveCount(1);
});
