import { describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { AppButton } from "./AppButton";

describe("AppButton", () => {
  test("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const screen = render(<AppButton label="保存" onPress={onPress} />);
    fireEvent.press(screen.getByText("保存"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const screen = render(<AppButton label="保存" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText("保存"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
