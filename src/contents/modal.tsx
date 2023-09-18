import React, { useState } from "react";
import type {
    PlasmoCSConfig,
    PlasmoCSUIJSXContainer,
    PlasmoCSUIProps,
    PlasmoRender
} from "plasmo"
import type { FC } from "react"
import { createRoot } from "react-dom/client"
import { Modal } from "antd";

export const config: PlasmoCSConfig = {
    matches: ["https://github.com/*"]
}

export const getRootContainer = () =>
    new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const rootContainerParent = document.querySelector(`#repository-details-container > ul`)
            if (rootContainerParent) {
                clearInterval(checkInterval)
                const rootContainer = document.createElement("li")
                const referenceNode = rootContainerParent.children[0];
                if (referenceNode) {
                    rootContainerParent.insertBefore(rootContainer, referenceNode);
                } else {
                    rootContainerParent.appendChild(rootContainer);
                }
                resolve(rootContainer)
            }
        }, 137)
    })

const PlasmoOverlay: FC<PlasmoCSUIProps> = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
      setIsModalOpen(true);
    };
  
    const handleOk = () => {
      setIsModalOpen(false);
    };
  
    const handleCancel = () => {
      setIsModalOpen(false);
    };
    return (
        <div className="float-left">
        <button onClick={showModal} className="btn-sm btn">
          Compare
        </button>
        <Modal title="Repo Comparer" open={isModalOpen} onCancel={handleCancel} footer={null}>
            <div>
                <p>Show A table here</p>
            </div>
        </Modal>          
        </div>
    )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
    createRootContainer
}) => {
    const rootContainer = await createRootContainer()
    const root = createRoot(rootContainer)
    root.render(<PlasmoOverlay />)
}