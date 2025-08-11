import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formData: {
    name: '',
    phone: '',
    whatsapp:'',
    email:'',
    creationDate: new Date().toISOString().split('T')[0],
    addressLine1: '',
     venue: '',
    category: "Select option",
    eventStartDate: '',
    eventEndDate: '',
    reference:'',
    selectResponse: '',
  },
  leadsList: [
    {
      id: "498749749274927",
      name: "John Doe",
      phone: "9876543210",
      whatsapp:"6453343333",
      email:"demo1@gmail.com",
      creationDate: "2025-03-01",
      addressLine1: "Palace ground, Jayamahal, Bengaluru, Karnataka 560006",
      // addressLine2: "Apt 56",
      venue: "Marriage Halls in Palace Ground",
      category: "Marriage",
      eventStartDate: "2025-05-01",
      eventEndDate: "2025-05-02",
    },
    {
      id: "2423424234234",
      name: "Jane Smith",
      phone: "9123456789",
      whatsapp:"9876865578",
      email:"demo2@gmail.com",
      creationDate: "2025-03-02",
      addressLine1: "Ward no, 20, 184, Vinay Guruji Road, opp. to Vinay Guruji Ashrama, Uttarahalli Hobli, Bengaluru, Karnataka 560061",
      // addressLine2: "Suite 200",
      venue: "Sri Vari Convention Hall",
      category: "Birthday",
      eventStartDate: "2025-06-10",
      eventEndDate: "2025-06-12",
    },
    {
      id: "554643567876",
      name: "Alice Johnson",
      phone: "8765432109",
      whatsapp:"8978675661",
      email:"demo3@gmail.com",
      creationDate: "2025-03-03",
      addressLine1: "3, Main Road, Royal LakeFront Phase-3 North, JP Nagar 9th Phase, J. P. Nagar, Raghavana Palya, Bengaluru, Karnataka 560108",
      // addressLine2: "Floor 4",
      venue: "Sumatra Wedding Venue",
      category: "Engagement",
      eventStartDate: "2025-07-15",
      eventEndDate: "2025-07-16",
    },
  ],
};

export const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    resetForm: (state) => {
      state.formData = initialState.formData;
    },

    addLead: (state) => {
      state.leadsList.push({ ...state.formData, id: String(Date.now()) });
      state.formData = initialState.formData;
    },

    updateLeadResponse: (state, action) => {
      const { id, response } = action.payload;
      const lead = state.leadsList.find((lead) => lead.id === id);
      if (lead) {
        lead.selectResponse = response;
      }
    },

    // New editLead action
    editLead: (state, action) => {
      const { id, updatedData } = action.payload;
      const leadIndex = state.leadsList.findIndex((lead) => lead.id === id);
      if (leadIndex !== -1) {
        state.leadsList[leadIndex] = { ...state.leadsList[leadIndex], ...updatedData };
      }
    },
  },
});

export const { setFormData, resetForm, addLead, updateLeadResponse, editLead } = leadsSlice.actions;

export const selectFormData = (state) => state.leads.formData;
export const selectLeadsList = (state) => state.leads.leadsList;

export default leadsSlice.reducer;
