import React, { useState } from 'react'
import axios from 'axios'
import qs from 'qs'

const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

const ClassSelectionPanelItem = props => {
  const {
    program,
    secondaryDataPanelHandler,
    renderOverlayHandler,
    selectedClassHandler,
    id
  } = props

  const [focused, focusedHandler] = useState(false)

  // ?? hook up axios here to book appointment

  const handleBooking = async () => {

    const requestBody = {
      class_id: `${id}`
    }

    axios.post(`/classes/${id}/book`, qs.stringify(requestBody), config)
      .then((res) => {
        console.log(res.data);
      })
      .catch((e) => {
        console.log(e);
      })
    renderOverlayHandler(true)
  }

  // !! needs a button and probably a confirmation thing in the overlay
  const handleCancellation = async () => {

    const requestBody = {
      class_id: `${id}`
    }

    axios.post(`/classes/${id}/cancel`, qs.stringify(requestBody), config)
      .then((res) => {
        console.log(res.data);
      })
      .catch((e) => {
        console.log(e);
      })
    renderOverlayHandler(true)
  }

  const handleSelectedClass = (e) => {
    selectedClassHandler(e.target.id)
    focusedHandler(true)
  }

  return (
    <li
      key={program.id}
      id={program.id}
      onClick={handleSelectedClass}
      className={`ClassSelectionPanel__listItem ClassSelectionPanel__listItem--${focused ? 'focused' : 'unfocused'}`}
    >
      <div className="ClassSelectionPanel__listInfo">
        <span className='ClassSelectionPanel__listItem--time'>{program.start_time}:00</span>
        <span className='ClassSelectionPanel__listItem--name'>{program.name}</span>
        <span className='ClassSelectionPanel__listItem--spots'>{program.spotsavailable}</span>
        <span className='ClassSelectionPanel__listItem--difficulty'>{program.difficulty}</span>
      </div>

      <div
        className={`ClassSelectionPanel__listItem--button ClassSelectionPanel__listItem--${!focused ? 'hideButton' : 'showButton'}`}
        onClick={handleBooking}
      >
        Book
        </div>
    </li>

  )
}

export default ClassSelectionPanelItem
