<template>
    <b-row class="cust-chat">
        <b-col lg="3" class="chat-data-left scroller">
            <div class="chat-sidebar-channel scroller ps-3 ">
                <h5 class="ms-3">Public Channels</h5>
                <ul class="iq-chat-ui nav flex-column nav-pills pe-0" role="tablist">
                    <li @click="removeSidebar()">
                        <a data-bs-toggle="pill" data-bs-target="#chatbox1" aria-selected="true" role="tab"
                            class="active">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/05.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-success"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Team Discussions</h6>
                                    <span>Lorem Ipsum is</span>
                                </div>
                                <div class="chat-meta float-end text-center mt-2">
                                    <div class="chat-msg-counter bg-primary text-white">20</div>
                                    <span class="text-nowrap">05 min</span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <a data-bs-toggle="pill" data-bs-target="#chatbox2" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/06.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-success"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Announcement</h6>
                                    <span>This Sunday we</span>
                                </div>
                                <div class="chat-meta float-end text-center mt-2">
                                    <div class="chat-msg-counter bg-primary text-white">10</div>
                                    <span class="text-nowrap">10 min</span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <h5 class="mt-3 ms-3">Private Channels</h5>
                        <a data-bs-toggle="pill" data-bs-target="#chatbox3" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/07.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-warning"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Doctors</h6>
                                    <span>There are many </span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <a data-bs-toggle="pill" data-bs-target="#chatbox4" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/08.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-success"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Nurses</h6>
                                    <span>passages of Lorem</span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <a data-bs-toggle="pill" data-bs-target="#chatbox5" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/09.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-info"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">OT Special</h6>
                                    <span>Lorem Ipsum used</span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <h5 class="mt-3 ms-3">Direct Message</h5>
                        <a data-bs-toggle="pill" data-bs-target="#chatbox6" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/10.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-dark"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Paul Molive</h6>
                                    <span>translation by</span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <a data-bs-toggle="pill" data-bs-target="#chatbox7" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/05.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-success"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Paige Turner</h6>
                                    <span>Lorem Ipsum which</span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <a data-bs-toggle="pill" data-bs-target="#chatbox8" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/06.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-primary"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Barb Ackue</h6>
                                    <span>simply random text</span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <a data-bs-toggle="pill" data-bs-target="#chatbox9" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/07.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-danger"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Maya Didas</h6>
                                    <span> but also the leap</span>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li @click="removeSidebar()">
                        <a data-bs-toggle="pill" data-bs-target="#chatbox10" aria-selected="false" tabindex="-1"
                            role="tab">
                            <div class="d-flex align-items-center cursor-pointer">
                                <div class="avatar me-3">
                                    <img src="/assets/images/user/08.jpg" alt="chatuserimage"
                                        class="avatar-50 rounded" />
                                    <span class="avatar-status"><i
                                            class="ri-checkbox-blank-circle-fill text-warning"></i></span>
                                </div>
                                <div class="chat-sidebar-name">
                                    <h6 class="mb-0">Monty Carlo</h6>
                                    <span>Contrary to popular</span>
                                </div>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </b-col>
        <b-col lg="9">
            <div class="chat-data chat-data-right">
                <div class="tab-content">
                    <ChatItems />
                </div>
            </div>
        </b-col>
    </b-row>
</template>
<script setup>
import ChatItems from '@/views/components/Chat/chat-items.vue';

const removeSidebar = () => {
    document.querySelector('.chat-data-left').classList.remove('show')
}
</script>