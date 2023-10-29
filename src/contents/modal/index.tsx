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

import { useStorage } from "@plasmohq/storage/hook"

import { TableView } from "~contents/table-view"

import { fetchRepoListData } from "../../service"

dayjs.extend(relativeTime)
export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"]
}

export const getRootContainer = () =>
  new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const rootContainerParent = document.querySelector(
        `#repository-details-container > ul`
      )
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
  const [repoList, setRepoList] = useStorage("repoList")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [repoData, setRepoData] = useState([])

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  // Fetch repo data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchRepoListData(repoList)
        setRepoData(result)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    if (repoList && repoList.length > 0) {
      fetchData()
    } else {
      setRepoData([])
    }
  }, [repoList])

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
    if (req.name == "openModal") {
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
