import { MenuOutlined } from "@ant-design/icons"
import { DndContext } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button, Input, message, Modal, Space, Table, Tag, Tooltip } from "antd"
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

import { numberjs } from "~utils/number"
import { validateAndExtractRepoInfo } from "~utils/utils"

import { fetchRepoData, fetchRepoListData } from "../service"

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

const Row = ({ children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: props["data-row-key"]
  })
  const style = {
    ...props.style,
    transform: CSS.Transform.toString(
      transform && {
        ...transform,
        scaleY: 1
      }
    ),
    transition,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 9999
        }
      : {})
  }
  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (child.key === "sort") {
          return React.cloneElement(child, {
            children: (
              <MenuOutlined
                ref={setActivatorNodeRef}
                style={{
                  cursor: "move",
                  touchAction: "none"
                }}
                {...listeners}
              />
            )
          })
        }
        return child
      })}
    </tr>
  )
}
const PlasmoOverlay = (prop: any) => {
  const columns = [
    {
      key: "sort"
    },
    {
      title: "Repo",
      dataIndex: "repo",
      key: "repo",
      render: (text, record, index) => (
        <a
          href={`https://github.com/${record.owner}/${record.repo}`}
          target="_blank">
          {text}
        </a>
      )
    },
    {
      title: "owner",
      dataIndex: "owner",
      key: "owner",
      render: (text) => (
        <a href={`https://github.com/${text}`} target="_blank">
          {text}
        </a>
      )
    },
    {
      title: "Stars",
      dataIndex: "stars",
      key: "stars",
      render: (text) => (
        <Tooltip title={numberjs(text).toString()}>
          <Tag color="gold">{numberjs(text).inGeneral()}</Tag>
        </Tooltip>
      )
    },
    {
      title: "Forks",
      dataIndex: "forks",
      key: "forks",
      render: (text) => (
        <Tooltip title={numberjs(text).toString()}>
          <Tag color="green">{numberjs(text).inGeneral()}</Tag>
        </Tooltip>
      )
    },
    {
      title: "Issues",
      dataIndex: "open_issues",
      key: "open_issues",
      render: (text) => (
        <Tooltip title={numberjs(text).toString()}>
          <Tag color="geekblue">{numberjs(text).inGeneral()}</Tag>
        </Tooltip>
      )
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language"
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => (
        <Tooltip title={dayjs(text).toString()}>
          <span>{dayjs(text).fromNow()}</span>
        </Tooltip>
      )
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (text) => (
        <Tooltip title={dayjs(text).toString()}>
          <span>{dayjs(text).fromNow()}</span>
        </Tooltip>
      )
    }
  ]
  const [repoList, setRepoList] = useStorage("repoList")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [repoData, setRepoData] = useState([])
  const [selectedRepo, setSelectedRepo] = useState([])
  const [inputVal, setInputVal] = useState("")
  const [inputErrMsg, setInputErrMsg] = useState("")
  const [tableKey, setTableKey] = useState(Date.now())
  const handleCancel = () => {
    setIsModalOpen(false)
  }
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

  const rowSelection = {
    onChange: (e, selectedRows) => {
      setSelectedRepo(selectedRows)
    }
  }

  const removeRepo = () => {
    setRepoList((previousRepoList) =>
      [...previousRepoList].filter(
        (item) =>
          !selectedRepo.some(
            (selectedItem) =>
              selectedItem.repo === item.repo &&
              selectedItem.owner === item.owner
          )
      )
    )
    setSelectedRepo([])
    setTableKey(Date.now()) // use TableKey to force update table
  }

  const onChagneInput = (e) => {
    setInputVal(e.target.value)
    setInputErrMsg("")
  }

  const onClickAdd = async () => {
    const inputRepo = validateAndExtractRepoInfo(inputVal)
    if (!inputRepo) {
      setInputErrMsg("Cannot correctly parse repository name")
      message.error("Cannot correctly parse repository name", 2, () => {})
      return
    } // set input status to warning
    fetchRepoData(inputRepo)
      .then((res) => {
        const isItemInList = repoList.some(
          (item) => item.owner === res.owner && item.repo === res.repo
        )
        if (!isItemInList) {
          setRepoList((prevRepoList) => [...prevRepoList, res])
          setInputVal("")
          setInputErrMsg("")
        }
      })
      .catch(() => {
        setInputErrMsg("Cannot fetch repository data")
        message.error("Cannot fetch repository data", 2, () => {})
      })
  }

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setRepoData((prev) => {
        const activeIndex = prev.findIndex(
          (i) => `${i.owner}/${i.repo}` === active.id
        )
        const overIndex = prev.findIndex(
          (i) => `${i.owner}/${i.repo}` === over?.id
        )
        return arrayMove(prev, activeIndex, overIndex)
      })
    }
  }
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
        <div style={{ minHeight: 350 }}>
          <Space style={{ marginBottom: 16 }}>
            <Input
              onChange={onChagneInput}
              value={inputVal}
              allowClear
              onPressEnter={inputVal === "" ? null : onClickAdd}
              status={inputErrMsg === "" ? "" : "error"}
              addonAfter={
                <Button
                  type="link"
                  onClick={onClickAdd}
                  size="small"
                  disabled={inputVal === ""}>
                  Add
                </Button>
              }
            />
            <Button
              onClick={removeRepo}
              danger
              disabled={selectedRepo?.length === 0}>
              Remove
            </Button>
          </Space>
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={onDragEnd}>
            <SortableContext
              // rowKey array
              items={repoData.map((i) => `${i.owner}/${i.repo}`)}
              strategy={verticalListSortingStrategy}>
              <Table
                key={tableKey}
                components={{
                  body: {
                    row: Row
                  }
                }}
                columns={columns}
                dataSource={repoData}
                rowKey={(record) => `${record.owner}/${record.repo}`}
                rowSelection={{
                  type: "checkbox",
                  ...rowSelection
                }}
                pagination={false}
              />
            </SortableContext>
          </DndContext>
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
