import { useStorage } from "@plasmohq/storage/hook"
import { sendToContentScript } from "@plasmohq/messaging"
import { Button } from "antd"
import { useEffect, useState } from "react";


function IndexPopup() {
  const [repoList, setRepoList] = useStorage("repoList", (v) => v === undefined ? []: v);
  const [currentRepo, setCurrentRepo] = useState({owner: "", repo: ""});
  const [isCurrentRepoAdded, setIsCurrentRepoAdded] = useState(false);

  const onClickShowDetail = () => {
    sendToContentScript({
      name: "openModal"
    })
  }
  useEffect(()=>{
    const GetOwnerAndName = async () => {
      const resp = await sendToContentScript({
        name: "GetFullRepoName"
      })
      if (resp) {
          setCurrentRepo(resp)
          setIsCurrentRepoAdded(repoList.some(item => item.owner === resp.owner && item.repo === resp.repo))
      } else {
        setCurrentRepo(null)
      }
    }
    GetOwnerAndName();
  }, [])
  
  useEffect(()=>{
    setIsCurrentRepoAdded(repoList.some(item => item.owner === currentRepo.owner && item.repo === currentRepo.repo))
  }, [repoList, currentRepo])
  
  const onClickAddCurrent = async () => {
    // if resp is not empty
    if (currentRepo) {
      // if currentRepo not in repoList
      const isItemInList = repoList.some(item => item.owner === currentRepo.owner && item.repo === currentRepo.repo);
      if (!isItemInList) {
        // Add currentRepo to repoList 
        setRepoList(prevRepoList => [...prevRepoList, currentRepo]);
      } 
    }
  }

  const onClickClear = () => {
    setRepoList([]);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 130
      }}>
        <Button onClick={onClickShowDetail} type="text">Show in detail</Button>
        { !isCurrentRepoAdded && 
          <Button onClick={onClickAddCurrent} type="text" >Add Current</Button>
        }
        <Button onClick={onClickClear} type="text" danger>Clear All</Button>
    </div>
  )
}

export default IndexPopup