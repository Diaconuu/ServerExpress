"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insert_user = void 0;
exports.Insert_user = `
  INSERT INTO users (email, password, name, surname)
  VALUES (?, ?, ?, ?)
`;
