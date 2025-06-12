import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export interface TestState {
  photos: File[];
  answers: Record<string, any>;
  taskId: string | null;
  uploadStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  reportStatus: 'idle' | 'processing' | 'ready' | 'failed';
  reportUrl: string | null;
  error: string | null;
}

const initialState: TestState = {
  photos: [],
  answers: {},
  taskId: null,
  uploadStatus: 'idle',
  submitStatus: 'idle',
  reportStatus: 'idle',
  reportUrl: null,
  error: null,
};

export const uploadPhotos = createAsyncThunk(
  'test/uploadPhotos',
  async (photos: File[], { rejectWithValue }) => {
    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('files', photo);
      });

      const response = await fetch('https://sirius-draw-test-94500a1b4a2f.herokuapp.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Upload failed: ${response.statusText}${errorData.detail ? ` - ${JSON.stringify(errorData.detail)}` : ''}`);
      }

      const result = await response.json();
      
      if (!result.task_id) {
        throw new Error('No task_id received from server');
      }

      return { taskId: result.task_id, photos };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Upload failed');
    }
  }
);

export const submitSurvey = createAsyncThunk(
  'test/submitSurvey',
  async ({ taskId, answers }: { taskId: string; answers: Record<string, any> }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://sirius-draw-test-94500a1b4a2f.herokuapp.com/submit-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: taskId,
          ...answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Survey submission failed: ${response.statusText}${errorData.detail ? ` - ${JSON.stringify(errorData.detail)}` : ''}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Survey submission failed');
    }
  }
);

export const checkReportStatus = createAsyncThunk(
  'test/checkReportStatus',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://sirius-draw-test-94500a1b4a2f.herokuapp.com/report/${taskId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Report not found');
        }
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Status check failed');
    }
  }
);

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    resetTest: (state) => {
      return initialState;
    },
    setAnswers: (state, action: PayloadAction<Record<string, any>>) => {
      state.answers = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload photos
      .addCase(uploadPhotos.pending, (state) => {
        state.uploadStatus = 'loading';
        state.error = null;
      })
      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.taskId = action.payload.taskId;
        state.photos = action.payload.photos;
      })
      .addCase(uploadPhotos.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.payload as string;
      })
      // Submit survey
      .addCase(submitSurvey.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(submitSurvey.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.reportStatus = 'processing';
      })
      .addCase(submitSurvey.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })
      // Check report status
      .addCase(checkReportStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(checkReportStatus.fulfilled, (state, action) => {
        const { status, report_url } = action.payload;
        if (status === 'completed' && report_url) {
          state.reportStatus = 'ready';
          state.reportUrl = report_url;
        } else if (status === 'processing') {
          state.reportStatus = 'processing';
        } else if (status === 'error') {
          state.reportStatus = 'failed';
          state.error = 'Report generation failed';
        }
      })
      .addCase(checkReportStatus.rejected, (state, action) => {
        state.reportStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetTest, setAnswers, clearError } = testSlice.actions;
export default testSlice.reducer;