import type { Meta, StoryObj } from "@storybook/react";

import { Header } from "./Header";
import Layout from "../pages/layout/Layout";

const meta = {
    title: "Campus/Layout",
    component: Layout,
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ["autodocs"],
    parameters: {
        // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
        layout: "fullscreen"
    }
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
