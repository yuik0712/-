"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ReleaseModal_1 = __importDefault(require("./ReleaseModal")); // 모달 컴포넌트 import
const App = () => {
    const [releaseModal, setReleaseModal] = (0, react_1.useState)(false);
    const releasePopup = () => {
        setReleaseModal(true);
        document.body.style.overflow = "hidden";
    };
    const closeReleasePopup = () => {
        setReleaseModal(false);
        document.body.style.overflow = "unset";
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: releasePopup, children: "\uBAA8\uB2EC \uC5EC\uB294 \uBC84\uD2BC" }), releaseModal && (0, jsx_runtime_1.jsx)(ReleaseModal_1.default, { closeReleasePopup: closeReleasePopup })] }));
};
exports.default = App;
