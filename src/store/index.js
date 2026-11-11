import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import projects from "./projectsSlice";
import tasks from "./tasksSlice";

export const makeStore = () => configureStore({ reducer: { auth, projects, tasks } });
