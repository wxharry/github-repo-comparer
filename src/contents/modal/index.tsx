import { Modal } from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender
} from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import { TableView } from "~components/table-view"

dayjs.extend(relativeTime)
export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"]
}

export const getRootContainer = () =>
  new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const rootContainerParent = document.querySelector(`body`)
      if (rootContainerParent) {
        clearInterval(checkInterval)
        const rootContainer = document.createElement("li")
        const referenceNode = rootContainerParent.children[0]
        if (referenceNode) {
          rootContainerParent.insertBefore(rootContainer, referenceNode)
        } else {
          rootContainerParent.appendChild(rootContainer)
        }
        resolve(rootContainer)
      }
    }, 137)
  })

const PlasmoOverlay = (prop: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
    if (req.name === "openModal") {
      setIsModalOpen(true)
      focus()
    }
    return true
  })

  return (
    <div className="float-left">
      <Modal
        title="Repo Comparer"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={1000}
        style={{ top: 150 }}
        keyboard>
        <TableView />
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
