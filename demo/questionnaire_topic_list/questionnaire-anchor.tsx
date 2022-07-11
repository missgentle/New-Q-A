import React, { useEffect, useState, useMemo } from 'react'
import { observer } from 'mobx-react'
import { Anchor } from '@gyzn/linglong-ui'

const { Link } = Anchor
const GroupNumber = 10

export default observer(
  (props: { topicTotal?: number; containerId: string; titleList?: string[]; offset?: number }) => {
    const { topicTotal = 0, containerId = '', titleList = [], offset = null } = props || {}

    const [targetOffset, setTargetOffset] = useState<number | undefined>(undefined)
    useEffect(() => {
      offset
        ? setTargetOffset(offset)
        : setTargetOffset(document.getElementById(containerId).clientHeight / 2)
    }, [containerId])

    const getAnchorList = useMemo(() => {
      if (titleList?.length)
        return titleList?.map((item, index) => (
          <Link key={index} href={`#title-${index + 1}`} title={item} />
        ))

      const anchorList = []
      const number = Math.round(topicTotal / GroupNumber)
      const more = topicTotal % GroupNumber
      for (let i = 0; i < number; i++) {
        anchorList.push([i * GroupNumber + 1, (i + 1) * GroupNumber])
      }
      if (more) {
        anchorList.push([number * GroupNumber + 1, number * GroupNumber + more])
      }
      return anchorList?.map((item) => (
        <Link key={item[0]} href={`#topic-${item[0]}`} title={`问卷${item[0]}~${item[1]}小结`} />
      ))
    }, [titleList, topicTotal])

    return (
      <div style={{ position: 'absolute', right: 100 }}>
        <Anchor
          targetOffset={targetOffset}
          getContainer={() => document.getElementById(containerId)}
        >
          {getAnchorList}
        </Anchor>
      </div>
    )
  },
)
