<template>
    <b-row>
        <b-col lg="3">
            <b-card no-body>
                <div class="course-picker card-body">
                    <flat-picker v-model="date" class="d-none inline_flatpickr" :config="inlineDatepicker"
                        placeholder="select Date"></flat-picker>
                </div>
            </b-card>
            <b-card no-body>
                <b-card-header class="d-flex justify-content-between">
                    <div class="header-title">
                        <h4 class="card-title ">Classification</h4>
                    </div>
                    <div class="card-header-toolbar d-flex align-items-center">
                        <a href="#"><i class="fa fa-plus  me-0" aria-hidden="true"></i></a>
                    </div>
                </b-card-header>
                <div class="card-body">
                    <ul class="list-unstyled m-0 p-0 job-classification">
                        <li class="iq-check"><i class="ri-check-line bg-danger me-2 text-white"></i>Meeting</li>
                        <li class="iq-check"><i class="ri-check-line bg-success me-2 text-white"></i>Business travel
                        </li>
                        <li class="iq-check"><i class="ri-check-line bg-warning me-2 text-white"></i>Personal Work</li>
                        <li class="iq-check"><i class="ri-check-line bg-info me-2 text-white"></i>Team Project</li>
                    </ul>
                </div>
            </b-card>
            <b-card no-body>
                <b-card-header class="d-flex justify-content-between">
                    <div class="header-title">
                        <h4 class="card-title">Today's Schedule</h4>
                    </div>
                </b-card-header>
                <div class="card-body">
                    <ul class="m-0 p-0 today-schedule">
                        <li class="d-flex">
                            <div class="schedule-icon"><i class="ri-checkbox-blank-circle-fill text-primary me-2"></i>
                            </div>
                            <div class="schedule-text"> <span>Web Design</span>{{ " " }}
                                <span>09:00 to 12:00</span>
                            </div>
                        </li>
                        <li class="d-flex">
                            <div class="schedule-icon"><i class="ri-checkbox-blank-circle-fill text-success me-2"></i>
                            </div>
                            <div class="schedule-text"> <span>Participate in Design</span>{{ " " }}
                                <span>09:00 to 12:00</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </b-card>
        </b-col>
        <b-col lg="9">
            <b-card no-body>
                <b-card-header class="d-flex justify-content-between">
                    <div class="card-title">
                        <b-card-title>Book Appointment</b-card-title>
                    </div>
                    <div class="card-action mt-2 mt-sm-0">
                        <button class="btn btn-primary-subtle ms-2" @click="showModal">
                            <svg class="icon-20" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4">
                                </path>
                            </svg>{{ "" }}
                            <span>Book Appointment</span>
                        </button>
                    </div>
                </b-card-header>
                <b-card-body class="custom-calendar-style">
                    <full-calender :events="mappedEvents" @onDateSelect="dateSelected" @onEventSelect="eventSelected"
                        class="calendar-s fc fc-ltr fc-unthemed"></full-calender>
                </b-card-body>
            </b-card>
        </b-col>
    </b-row>
    <b-modal v-model="show" title="Add a events" cancel-title="Discard Changes" cancel-variant="danger-subtle"
        ok-title="Save" ok-variant="primary-subtle">
        <form>
            <div class="d-flex flex-column align-items-start">
                <input type="hidden" name="id">
                <input type="hidden" name="appointment_type">
                <div class="nav me-3 form-group btn-group" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                    <button class="btn btn-primary  active" id="v-pills-home-tab" data-bs-toggle="pill"
                        data-bs-target="#v-pills-home" type="button" role="tab" aria-controls="v-pills-home"
                        aria-selected="true">Event</button>
                    <button class="btn btn-primary " id="v-pills-profile-tab" data-bs-toggle="pill"
                        data-bs-target="#v-pills-profile" type="button" role="tab" aria-controls="v-pills-profile"
                        aria-selected="false">Task</button>
                    <button class="btn btn-primary " id="v-pills-messages-tab" data-bs-toggle="pill"
                        data-bs-target="#v-pills-messages" type="button" role="tab" aria-controls="v-pills-messages"
                        aria-selected="false">Reminder</button>
                </div>
                <div class="tab-content w-100" id="v-pills-tabContent">
                    <div class="tab-pane fade active show" id="v-pills-home" role="tabpanel"
                        aria-labelledby="v-pills-home-tab">
                        <b-row class="g-3 align-items-center form-group">
                            <b-col cols="2">
                                <label class="col-form-label">Title</label>
                            </b-col>
                            <b-col cols="10">
                                <input type="text" class="form-control">
                            </b-col>
                        </b-row>
                        <b-row class="g-3 align-items-center form-group">
                            <b-col cols="2">
                                <label class="col-form-label">
                                    <svg class="icon-24" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.09277 9.40421H20.9167" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round">
                                        </path>
                                        <path d="M16.442 13.3097H16.4512" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round">
                                        </path>
                                        <path d="M12.0045 13.3097H12.0137" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round">
                                        </path>
                                        <path d="M7.55818 13.3097H7.56744" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round">
                                        </path>
                                        <path d="M16.442 17.1962H16.4512" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round">
                                        </path>
                                        <path d="M12.0045 17.1962H12.0137" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round">
                                        </path>
                                        <path d="M7.55818 17.1962H7.56744" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round">
                                        </path>
                                        <path d="M16.0433 2V5.29078" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round"></path>
                                        <path d="M7.96515 2V5.29078" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round"></path>
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M16.2383 3.5791H7.77096C4.83427 3.5791 3 5.21504 3 8.22213V17.2718C3 20.3261 4.83427 21.9999 7.77096 21.9999H16.229C19.175 21.9999 21 20.3545 21 17.3474V8.22213C21.0092 5.21504 19.1842 3.5791 16.2383 3.5791Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </svg>
                                </label>
                            </b-col>
                            <b-col cols="10">
                                <flat-picker v-model="date" class="form-control" :config="dateOption"></flat-picker>
                            </b-col>
                        </b-row>
                        <b-row class="g-3 align-items-center form-group">
                            <b-col cols="2">
                                <label class="col-form-label">
                                    <svg class="icon-24" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M21.2498 12.0005C21.2498 17.1095 17.1088 21.2505 11.9998 21.2505C6.8908 21.2505 2.7498 17.1095 2.7498 12.0005C2.7498 6.89149 6.8908 2.75049 11.9998 2.75049C17.1088 2.75049 21.2498 6.89149 21.2498 12.0005Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M15.4314 14.9429L11.6614 12.6939V7.84689" stroke="currentColor"
                                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </label>
                            </b-col>
                            <b-col cols="10" class="d-flex align-items-center justify-content-center">
                                <flat-picker v-model="startTime" class="form-control"
                                    :config="timeOption"></flat-picker>
                                <span class="mx-2">To</span>
                                <flat-picker v-model="endTime" class="form-control" :config="timeOption"></flat-picker>
                            </b-col>
                        </b-row>
                        <b-row class="g-3 align-items-center form-group">
                            <b-col cols="2">
                                <label class="col-form-label">
                                    <svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M9.59151 15.2068C13.2805 15.2068 16.4335 15.7658 16.4335 17.9988C16.4335 20.2318 13.3015 20.8068 9.59151 20.8068C5.90151 20.8068 2.74951 20.2528 2.74951 18.0188C2.74951 15.7848 5.88051 15.2068 9.59151 15.2068Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M9.59157 12.0198C7.16957 12.0198 5.20557 10.0568 5.20557 7.63476C5.20557 5.21276 7.16957 3.24976 9.59157 3.24976C12.0126 3.24976 13.9766 5.21276 13.9766 7.63476C13.9856 10.0478 12.0356 12.0108 9.62257 12.0198H9.59157Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                        <path
                                            d="M16.4829 10.8815C18.0839 10.6565 19.3169 9.28253 19.3199 7.61953C19.3199 5.98053 18.1249 4.62053 16.5579 4.36353"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                        <path
                                            d="M18.5952 14.7322C20.1462 14.9632 21.2292 15.5072 21.2292 16.6272C21.2292 17.3982 20.7192 17.8982 19.8952 18.2112"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </svg>
                                </label>
                            </b-col>
                            <b-col cols="10">
                                <select name="guest" class="form-select" id="guest">
                                    <option value="">Select Guest</option>
                                    <option value="">Anni</option>
                                    <option value="">Bini</option>
                                    <option value="">Chimpi</option>
                                </select>
                            </b-col>
                        </b-row>
                        <b-row class="g-3 align-items-center form-group">
                            <b-col cols="2">
                                <label class="col-form-label">
                                    <svg class="icon-32" width="32" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M11.4925 2.78906H7.75349C4.67849 2.78906 2.75049 4.96606 2.75049 8.04806V16.3621C2.75049 19.4441 4.66949 21.6211 7.75349 21.6211H16.5775C19.6625 21.6211 21.5815 19.4441 21.5815 16.3621V12.3341"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M8.82812 10.921L16.3011 3.44799C17.2321 2.51799 18.7411 2.51799 19.6721 3.44799L20.8891 4.66499C21.8201 5.59599 21.8201 7.10599 20.8891 8.03599L13.3801 15.545C12.9731 15.952 12.4211 16.181 11.8451 16.181H8.09912L8.19312 12.401C8.20712 11.845 8.43412 11.315 8.82812 10.921Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                        <path d="M15.1655 4.60254L19.7315 9.16854" stroke="currentColor"
                                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                        </path>
                                    </svg>
                                </label>
                            </b-col>
                            <b-col cols="10">
                                <textarea name="description" id="description" class="form-control custom-textarea"
                                    rows="2" placeholder="Description"></textarea>
                            </b-col>
                        </b-row>
                    </div>
                    <div class="tab-pane fade " id="v-pills-profile" role="tabpanel"
                        aria-labelledby="v-pills-profile-tab">
                        <b-row>
                            <b-col md="12">
                                <b-row class="g-3 align-items-center form-group">
                                    <b-col cols="2">
                                        <label class="col-form-label">Title</label>
                                    </b-col>
                                    <b-col cols="10">
                                        <input type="text" class="form-control">
                                    </b-col>
                                </b-row>
                                <b-row class="g-3 align-items-center form-group">
                                    <b-col cols="2">
                                        <label class="col-form-label">
                                            <svg class="icon-24" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3.09277 9.40421H20.9167" stroke="currentColor"
                                                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                                <path d="M16.442 13.3097H16.4512" stroke="currentColor"
                                                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                                <path d="M12.0045 13.3097H12.0137" stroke="currentColor"
                                                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                                <path d="M7.55818 13.3097H7.56744" stroke="currentColor"
                                                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                                <path d="M16.442 17.1962H16.4512" stroke="currentColor"
                                                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                                <path d="M12.0045 17.1962H12.0137" stroke="currentColor"
                                                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                                <path d="M7.55818 17.1962H7.56744" stroke="currentColor"
                                                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                                <path d="M16.0433 2V5.29078" stroke="currentColor" stroke-width="1.5"
                                                    stroke-linecap="round" stroke-linejoin="round"></path>
                                                <path d="M7.96515 2V5.29078" stroke="currentColor" stroke-width="1.5"
                                                    stroke-linecap="round" stroke-linejoin="round"></path>
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.2383 3.5791H7.77096C4.83427 3.5791 3 5.21504 3 8.22213V17.2718C3 20.3261 4.83427 21.9999 7.77096 21.9999H16.229C19.175 21.9999 21 20.3545 21 17.3474V8.22213C21.0092 5.21504 19.1842 3.5791 16.2383 3.5791Z"
                                                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                    stroke-linejoin="round"></path>
                                            </svg>
                                        </label>
                                    </b-col>
                                    <b-col cols="10">
                                        <flat-picker v-model="date" class="form-control"
                                            :config="dateOption"></flat-picker>
                                    </b-col>
                                </b-row>
                            </b-col>
                        </b-row>
                    </div>
                    <div class="tab-pane fade" id="v-pills-messages" role="tabpanel"
                        aria-labelledby="v-pills-messages-tab">
                        <b-row>
                            <b-col md="12">
                                <b-row class="g-3 align-items-center form-group">
                                    <b-col cols="2">
                                        <label class="col-form-label">Title</label>
                                    </b-col>
                                    <b-col cols="10">
                                        <input type="text" class="form-control">
                                    </b-col>
                                </b-row>
                                <b-col md="12">
                                    <b-row>
                                        <b-col md="6">
                                            <b-row class="g-3 align-items-center form-group">
                                                <b-col cols="2">
                                                    <label class="col-form-label">
                                                        <svg class="icon-24" width="24" height="24" viewBox="0 0 24 24"
                                                            fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M3.09277 9.40421H20.9167" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                            </path>
                                                            <path d="M16.442 13.3097H16.4512" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                            </path>
                                                            <path d="M12.0045 13.3097H12.0137" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                            </path>
                                                            <path d="M7.55818 13.3097H7.56744" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                            </path>
                                                            <path d="M16.442 17.1962H16.4512" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                            </path>
                                                            <path d="M12.0045 17.1962H12.0137" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                            </path>
                                                            <path d="M7.55818 17.1962H7.56744" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                            </path>
                                                            <path d="M16.0433 2V5.29078" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round"></path>
                                                            <path d="M7.96515 2V5.29078" stroke="currentColor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round"></path>
                                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                                d="M16.2383 3.5791H7.77096C4.83427 3.5791 3 5.21504 3 8.22213V17.2718C3 20.3261 4.83427 21.9999 7.77096 21.9999H16.229C19.175 21.9999 21 20.3545 21 17.3474V8.22213C21.0092 5.21504 19.1842 3.5791 16.2383 3.5791Z"
                                                                stroke="currentColor" stroke-width="1.5"
                                                                stroke-linecap="round" stroke-linejoin="round">
                                                            </path>
                                                        </svg>
                                                    </label>
                                                </b-col>
                                                <b-col cols="10">
                                                    <flat-picker v-model="date" class="form-control"
                                                        :config="dateOption"></flat-picker>
                                                </b-col>
                                            </b-row>
                                        </b-col>
                                        <b-col md="6">
                                            <b-row class="g-3 align-items-center form-group">
                                                <b-col cols="2">
                                                    <svg class="icon-32" width="32" viewBox="0 0 24 24" fill="none"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                                            d="M12 17.8476C17.6392 17.8476 20.2481 17.1242 20.5 14.2205C20.5 11.3188 18.6812 11.5054 18.6812 7.94511C18.6812 5.16414 16.0452 2 12 2C7.95477 2 5.31885 5.16414 5.31885 7.94511C5.31885 11.5054 3.5 11.3188 3.5 14.2205C3.75295 17.1352 6.36177 17.8476 12 17.8476Z"
                                                            stroke="currentColor" stroke-width="1.5"
                                                            stroke-linecap="round" stroke-linejoin="round">
                                                        </path>
                                                        <path
                                                            d="M14.3889 20.8572C13.0247 22.3719 10.8967 22.3899 9.51953 20.8572"
                                                            stroke="currentColor" stroke-width="1.5"
                                                            stroke-linecap="round" stroke-linejoin="round">
                                                        </path>
                                                    </svg>
                                                </b-col>
                                                <b-col cols="10">
                                                    <select class="form-select">
                                                        <option>Repeat</option>
                                                        <option>Every 4 Day</option>
                                                        <option>Every 7 Day</option>
                                                        <option>Every 10 Day</option>
                                                    </select>
                                                </b-col>
                                            </b-row>
                                        </b-col>
                                    </b-row>
                                </b-col>
                            </b-col>
                        </b-row>
                    </div>
                </div>
            </div>
        </form>
    </b-modal>
</template>

<script setup>
// Library
import { ref, onMounted, onUnmounted } from 'vue'
import moment from 'moment'

// Library Components
import FlatPicker from 'vue-flatpickr-component'

// Components
import FullCalender from '../../../components/custom/calender/FullCalender.vue'

// Variables
const showModal = () => {
    show.value = true
}

const inlineDatepicker = ref({
    inline: true,
})
const date = ref('')
const startTime = ref('')
const endTime = ref('')
const show = ref(false)
const dateOption = ref({
    mode: 'range'
})
const timeOption = ref({
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i'
})
const events = ref([
    {
        title: 'Click for Google',
        url: 'http://google.com/',
        start: moment(new Date(), 'YYYY-MM-DD').add(-20, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    },
    {
        title: 'All Day Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(-18, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(108,117,125,0.2)',
        textColor: 'rgba(108,117,125,1)',
        borderColor: 'rgba(108,117,125,1)'
    },
    {
        title: 'Long Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(-16, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        end: moment(new Date(), 'YYYY-MM-DD').add(-13, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(8,130,12,0.2)',
        textColor: 'rgba(8,130,12,1)',
        borderColor: 'rgba(8,130,12,1)'
    },
    {
        groupId: '999',
        title: 'Repeating Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(-14, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        color: '#047685',
        backgroundColor: 'rgba(4,118,133,0.2)',
        textColor: 'rgba(4,118,133,1)',
        borderColor: 'rgba(4,118,133,1)'
    },
    {
        groupId: '999',
        title: 'Repeating Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(-12, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(235,153,27,0.2)',
        textColor: 'rgba(235,153,27,1)',
        borderColor: 'rgba(235,153,27,1)'
    },
    {
        groupId: '999',
        title: 'Repeating Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(-10, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(206,32,20,0.2)',
        textColor: 'rgba(206,32,20,1)',
        borderColor: 'rgba(206,32,20,1)'
    },
    {
        title: 'Birthday Party',
        start: moment(new Date(), 'YYYY-MM-DD').add(-8, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    },
    {
        title: 'Meeting',
        start: moment(new Date(), 'YYYY-MM-DD').add(-6, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    },
    {
        title: 'Birthday Party',
        start: moment(new Date(), 'YYYY-MM-DD').add(-5, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(235,153,27,0.2)',
        textColor: 'rgba(235,153,27,1)',
        borderColor: 'rgba(235,153,27,1)'
    },
    {
        title: 'Birthday Party',
        start: moment(new Date(), 'YYYY-MM-DD').add(-2, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(235,153,27,0.2)',
        textColor: 'rgba(235,153,27,1)',
        borderColor: 'rgba(235,153,27,1)'
    },

    {
        title: 'Meeting',
        start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    },
    {
        title: 'Click for Google',
        url: 'http://google.com/',
        start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T06:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    },
    {
        groupId: '999',
        title: 'Repeating Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T07:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    },
    {
        title: 'Birthday Party',
        start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T08:30:00.000Z',
        backgroundColor: 'rgba(235,153,27,0.2)',
        textColor: 'rgba(235,153,27,1)',
        borderColor: 'rgba(235,153,27,1)'
    },
    {
        title: 'Doctor Meeting',
        start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(235,153,27,0.2)',
        textColor: 'rgba(235,153,27,1)',
        borderColor: 'rgba(235,153,27,1)'
    },
    {
        title: 'All Day Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    },
    {
        groupId: '999',
        title: 'Repeating Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(8, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    },
    {
        groupId: '999',
        title: 'Repeating Event',
        start: moment(new Date(), 'YYYY-MM-DD').add(10, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
        backgroundColor: 'rgba(58,87,232,0.2)',
        textColor: 'rgba(58,87,232,1)',
        borderColor: 'rgba(58,87,232,1)'
    }
],)
// Functions
const dateSelected = (e) => {
    console.log(e)
    show.value = true
}
const eventSelected = (e) => {
    console.log(e)
    show.value = true
}


const mappedEvents = ref(events.value.map(event => ({
    title: event.title,
    start: event.start,
    end: event.end || null,
    display: 'block',
    backgroundColor: event.backgroundColor,
    borderColor: event.borderColor,
    textColor: event.textColor
})));

// Call this function when needed to update the mapped events dynamically
const updateMappedEvents = () => {
    mappedEvents.value = events.value.map(event => ({
        title: event.title,
        start: event.start,
        end: event.end || null,
        display: 'block',
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        textColor: event.textColor
    }));
};

// Function to adjust view height
const viewHeight = () => {
    const element = document.querySelector('.fc-list-table');
    if (element) {
        const contentHeight = element.scrollHeight + 5;
        const grandparentElement = element.parentElement?.parentElement?.parentElement;

        if (grandparentElement) {
            grandparentElement.style.setProperty('--custom-height', `${contentHeight}px`);
            grandparentElement.classList.add('custom-grandparent-height');
            // console.log('Content height:', contentHeight);
        }
    } else {
        const grandparentElement = document.querySelector('.fc-view-harness');

        if (grandparentElement) {
            grandparentElement.style.removeProperty('--custom-height');
            if (grandparentElement.classList.contains('custom-grandparent-height')) {
                grandparentElement.classList.remove('custom-grandparent-height');
            }
        }
    }
};

// Lifecycle hooks
onMounted(() => {
    updateMappedEvents(); // Ensure events are mapped properly on mount
    viewHeight();
    document.addEventListener('click', viewHeight);
});

onUnmounted(() => {
    document.removeEventListener('click', viewHeight);
});
</script>