import React, { useEffect, useState } from 'react'

// ?? Components
import Nav from '../../components/Nav/Nav';
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';

// ?? Box Components
import TeacherFilterBox from '../../components/boxes/scheduleBoxes/TeacherFilterBox/TeacherFilterBox'
import DifficultiesFilterBox from '../../components/boxes/scheduleBoxes/DifficultiesFilterBox/DifficultiesFilterBox'
import DisciplinesFilterBox from '../../components/boxes/scheduleBoxes/DisciplinesFilterBox/DisciplinesFilterBox'
import ProgramsFilterBox from '../../components/boxes/scheduleBoxes/ProgramsFilterBox/ProgramsFilterBox'
import ClearFilterBox from '../../components/boxes/scheduleBoxes/ClearFilterBox/ClearFilterBox'

// ?? Panel Components
import CalendarPanel from '../../components/panels/CalendarPanel/CalendarPanel'
import NamaslayPanel from '../../components/panels/NamaslayPanel/NamaslayPanel'
import DynamicDataPanel from '../../components/panels/DynamicDataPanel/DynamicDataPanel'
import ClassSelectionPanel from '../../components/panels/ClassSelectionPanel/ClassSelectionPanel.js';
import ScheculePrimaryDataPanel from '../../components/panels/ScheculePrimaryDataPanel/ScheculePrimaryDataPanel'
import ImagePanelBig from '../../components/panels/ImagePanelBig/ImagePanelBig'


import axios from 'axios'

import ScheduleScreens from '../../screens/scheduleScreens/ScheculeScreens.js';

import './Schedule.scss';

const Schedule = props => {

  // ?? Component Props
  const {
    handleShowLanding,
    handleShowNav,
    handleShowPunchCard,
    handleShowSchedule,
    handleShowUserProfile,
    handleShowUserDataDash,
    navState,
    currentUser,
    currentUserHandler,
  } = props;

  // ?? Component State
  const [scheduleData, setScheduleData] = useState();
  const [dynamicData, setDynamicData] = useState([]);
  const [selectedDay, selectedDayHandler] = useState(1)
  const [selectedMonth, selectedMonthHandler] = useState(6)
  const [classesForDay, classesForDayHandler] = useState([])
  const [filteredClassesForDay, filteredClassesForDayHandler] = useState([])
  const [primaryDataPanel, primaryDataPanelHandler] = useState({ title: null, info: null })
  const [secondaryDataPanel, secondaryDataPanelHandler] = useState({ title: null, info: null })
  const [dataLoad, dataLoadHandler] = useState(false)
  const [selectedClass, selectedClassHandler] = useState(-1)
  const [renderOverlay, renderOverlayHandler] = useState(false)
  const [renderPayment, renderPaymentHandler] = useState(false)
  const [showAnimation, showAnimationHandler] = useState(true)
  const [bookingInfo, bookingInfoHandler] = useState(null)
  const [quote, setQuote] = useState({ words: null, id: null, author: null })
  const [teacherFilterSelected, teacherFilterSelectedHandler] = useState(false)
  const [disciplineFilterSelected, disciplineFilterSelectedHandler] = useState(false)
  const [programFilterSelected, programFilterSelectedHandler] = useState(false)
  const [difficultiesFilterSelected, difficultiesFilterSelectedHandler] = useState(false)

  useEffect(() => {
    const getQuote = async () => {
      try {
        const res = await axios.get('/api/quote')
        const words = res.data[0].quote
        const id = res.data[0].id
        const author = res.data[0].author
        setQuote({ words, id, author })
      }
      catch (e) {
        throw e
      }
    }
    getQuote()
  }, [])

  useEffect(() => {
    showAnimationHandler(true)
    // ?? Set Class Filter to current day
    const getTodayID = () => {
      const today = new Date(Date.now())
      return today.getDate()
    }
    // ?? Set month from calendar
    // ^^ Request data for current month
    axios.get(`/api/${selectedMonth}`)
      .then(function (response) {
        const { classes, teachers, difficulties, disciplines, programs, daysLegend } = response.data
        // ?? Set State with data
        setScheduleData({
          teachers,
          difficulties,
          disciplines,
          programs,
          classes,
          daysLegend
        })
        return response.data
      })
      // !! refactor to useEffect
      .then((data) => {
        const today = getTodayID()
        const classesToday = data.classes.filter(c => c.daynumber === today && c.monthnumber === selectedMonth
        )
        classesForDayHandler(classesToday)
        filteredClassesForDayHandler(classesToday)
        dataLoadHandler(true)
        showAnimationHandler(false)
        selectedDayHandler(today)
      }
      )
      .catch(function (error) {
        console.log(error);
      })
  }, [selectedMonth])

  const handleCalendarDayChange = date => {
    let day = ("0" + date.getDate()).slice(-2)
    selectedDayHandler(day * 1)
    classesForDayHandler(getClassesByDay(day * 1, selectedMonth))
    console.log('all classes for day:', classesForDay);
    filteredClassesForDayHandler(getClassesByDay(day * 1, selectedMonth))
  }

  const getClassesByDay = (dayID, monthNumber) => {
    return [...scheduleData.classes].filter(c => {
      if (c.daynumber === dayID && c.monthnumber === monthNumber) {
        return true;
      }
    })
  }

  const handleCalendarMonthChange = date => {

  }

  const handleTeachersFilter = () => {
    const teachers = scheduleData.teachers.map((t) => t)
    teachers.push('Teacher')
    setDynamicData(teachers);
    teacherFilterSelectedHandler(true)
    disciplineFilterSelectedHandler(false)
    programFilterSelectedHandler(false)
    difficultiesFilterSelectedHandler(false)
  }

  const handleDisciplinesFilter = () => {
    console.log('hello puppies')
    const disciplines = scheduleData.disciplines.map((t) => t)
    disciplines.push('Discipline')
    setDynamicData(disciplines);
    teacherFilterSelectedHandler(false)
    disciplineFilterSelectedHandler(true)
    programFilterSelectedHandler(false)
    difficultiesFilterSelectedHandler(false)
  }

  // !! CSS is fucked up here
  const handleProgramsFilter = () => {

    const programs = scheduleData.programs.map((t) => t)
    programs.push('Program')
    setDynamicData(programs);
    teacherFilterSelectedHandler(false)
    disciplineFilterSelectedHandler(false)
    programFilterSelectedHandler(true)
    difficultiesFilterSelectedHandler(false)
  }

  const handleDifficultiesFilter = () => {
    const difficulties = scheduleData.difficulties.map((t) => t);
    difficulties.push('Difficulty')
    setDynamicData(difficulties);
    teacherFilterSelectedHandler(false)
    disciplineFilterSelectedHandler(false)
    programFilterSelectedHandler(false)
    difficultiesFilterSelectedHandler(true)
  }

  const handleTypeSelection = (id, type) => {
    let newClassesForDay;
    if (type === 'Discipline') {
      const discipline = scheduleData.disciplines.filter(el => el.id === id)
      console.log(discipline);
      primaryDataPanelHandler({ title: discipline[0], info: discipline[0].description })
      newClassesForDay = classesForDay.filter(el => el.discipline_id === discipline[0].id)
    } else if (type === 'Teacher') {
      const teacher = scheduleData.teachers.filter(el => el.id === id)
      console.log(teacher);
      primaryDataPanelHandler({ title: teacher[0], info: teacher[0].bio, img: teacher[0].imageurlcutout })
      newClassesForDay = classesForDay.filter(el => el.teacher_id === teacher[0].id)
    } else if (type === 'Program') {
      const program = scheduleData.programs.filter(el => el.id === id)
      console.log(program);
      primaryDataPanelHandler({ title: program[0], info: program[0].description })
      newClassesForDay = classesForDay.filter(el => el.program_id === program[0].id)
    } else if (type === 'Difficulty') {
      const difficulty = scheduleData.difficulties.filter(el => el.id === id)
      console.log(difficulty);
      primaryDataPanelHandler({ title: difficulty[0], info: difficulty[0].description })
      newClassesForDay = classesForDay.filter(el => el.difficulty === difficulty[0].description)
    } else {
      return;
    }
    filteredClassesForDayHandler(newClassesForDay)
  }

  const clearFilters = () => {
    const classesForDaySelected = getClassesByDay(selectedDay, selectedMonth)
    filteredClassesForDayHandler(classesForDaySelected)
  }

  return (
    <div className="Schedule">
      {renderOverlay && (
        <ScheduleScreens
          currentUser={currentUser}
          currentUserHandler={currentUserHandler}
          handleShowPunchCard={handleShowPunchCard}
          bookingInfo={bookingInfo}
          selectedClass={selectedClass}
          secondaryDataPanel={secondaryDataPanel}
          renderOverlayHandler={renderOverlayHandler}
          renderPayment={renderPayment}
        />
      )}

      <Nav
        handleShowLanding={handleShowLanding}
        handleShowNav={handleShowNav}
        handleShowPunchCard={handleShowPunchCard}
        handleShowSchedule={handleShowSchedule}
        handleShowUserProfile={handleShowUserProfile}
        handleShowUserDataDash={handleShowUserDataDash}
        navState={navState}
      />
      <div className="Schedule__namaslay">
        <NamaslayPanel
          panelSize='small'
        />
      </div>
      {currentUser &&
        <div className="Schedule__classesLeft">Passes Left: {currentUser.passCount}
        </div>}
      {!currentUser &&
        <div className="Schedule__classesLeft">home
      </div>}

      <div className="Schedule__calendar">
        <CalendarPanel
          handleCalendarDayChange={handleCalendarDayChange}
          handleCalendarMonthChange={handleCalendarMonthChange}
        />
      </div>

      <div className="Schedule__classSelection">
        {dataLoad &&
          <ClassSelectionPanel
            renderOverlayHandler={renderOverlayHandler}
            renderPaymentHandler={renderPaymentHandler}
            secondaryDataPanelHandler={secondaryDataPanelHandler}
            classesForDay={filteredClassesForDay}
            selectedClass={selectedClass}
            selectedClassHandler={selectedClassHandler}
            currentUser={currentUser}
            showAnimation={showAnimation}
            bookingInfoHandler={bookingInfoHandler}
            scheduleData={scheduleData}
          />
        }
        {!dataLoad && (
          <div className="Schedule__classSelection--animate">
            <LoadingAnimation />
          </div>
        )}
      </div>

      <div className="Schedule__dynamicSelection">
        <DynamicDataPanel
          quote={quote}
          handleTypeSelection={handleTypeSelection}
          data={dynamicData} />
      </div>

      <div className="Schedule__teacherFilter">
        <TeacherFilterBox
          handleTeacherFilter={handleTeachersFilter}
          teacherFilterSelected={teacherFilterSelected}
        />
      </div>

      <div className="Schedule__disciplineFilter">
        <DisciplinesFilterBox
          handleDisciplinesFilter={handleDisciplinesFilter}
          disciplineFilterSelected={disciplineFilterSelected}
        />
      </div>

      <div className="Schedule__eventFilter">
        <ProgramsFilterBox
          handleProgramsFilter={handleProgramsFilter}
          programFilterSelected={programFilterSelected}
        />
      </div>

      <div className="Schedule__difficultyFilter">
        <DifficultiesFilterBox
          handleDifficultiesFilter={handleDifficultiesFilter}
          difficultiesFilterSelected={difficultiesFilterSelected}
        />
      </div>

      <div className="Schedule__clearFilters">
        <ClearFilterBox
          clearFilters={clearFilters}
        />
      </div>

      <div className="Schedule__teacherInfo">
        <ScheculePrimaryDataPanel
          key='primary1'
          primaryDataPanel={primaryDataPanel}
        />
      </div>

      <div className="Schedule__classInfo">
        <ImagePanelBig
          size="18"
          //girl-meditating
          url='https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=862&q=80'
        />
      </div>
    </div>
  )
}

export default Schedule;
