import { useState, useEffect, useRef, ChangeEvent } from 'react'

// ** MUI imports
import Avatar from '@mui/material/Avatar';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { MuiTelInput } from 'mui-tel-input'
import StructureSelect from 'src/views/structure/structure-select'
import format from 'date-fns/format'
import { ru } from 'date-fns/locale'
import DatePicker, { registerLocale, ReactDatePickerProps } from 'react-datepicker'
import DateCustomInput from './date-custom-input';

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Component
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Types import
import { DefaultEmployee } from 'src/types/employee-types'

const defaultValues: DefaultEmployee = {
  id: '',
  name: '',
  bday: null,
  mobile: '',
  mobile_personal: '',
  email: '',
  email_personal: '',
  title: '',
  note: '',
  structure_id: '',
  position_id: {
    id: '',
    name: '',
    custom: 0
  },
  hide_in_all: false,
  jpegphoto: '',
  thumbnailphoto: '',
}

const showMinErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `${field} - поле обязательно для заполнения`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} - введите не менее ${min} символов`
  } else {
    return ''
  }
}

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, obj => showMinErrors('Имя', obj.value.length, obj.min))
    .required(),
  bday: yup.date().nullable(),
  mobile: yup
    .string()
    .nullable()
    .matches(/^(|.\d{4,5})$/, "Введите 5 чисел"),
  mobile_personal: yup
    .string(),
  email: yup.string().nullable().email('Проверьте правильность написания адреса'),
  
  // ** We still have email_personal field in backend, so let's keep next line commented until better times:
  // ** email_personal: yup.string().nullable().email('Проверьте правильность написания адреса'),
  
  title: yup
    .string()
    .min(5, obj => showMinErrors('Заголовок', obj.value.length, obj.min)),
  note: yup
    .string()
    .nullable(),
  structure_id: yup
    .string()
    .required(),
  position_id: yup.object().shape({
    id: yup.string().required()
  }),
  hide_in_all: yup.boolean(),
  jpegphoto: yup
    .string()
    .nullable(),
  thumbnailphoto: yup
    .string()
    .nullable()
})

const EmployeeAction = (props: any) => {
  const [imageToUpload, setImageToUpload] = useState<any>();
  const [cropper, setCropper] = useState<any>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  // ** Hook useForm
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, isValid, errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  registerLocale('ru', ru)

  const onSubmit = (data: any) => {
    data.email_personal = null;
    
    if (data?.bday) { data.bday = format(data.bday, 'dd.MM.yyyy') }
    else { data.bday = null }
    if (data.mobile?.length == 0) { data.mobile = null }
    if (data.mobile_personal?.length == 0) { data.mobile_personal = null }
    if (data.email?.length == 0) { data.email = null }
    if (data.email_personal?.length == 0) { data.email_personal = null }
    if (data.note?.length == 0) { data.note = null }

    if (data.jpegphoto?.length > 0) {
      data.jpegphoto = data.jpegphoto.split(',')[1];
    } else {
      data.jpegphoto = null;
    }

    if (data.thumbnailphoto?.length > 0) {
      data.thumbnailphoto = data.thumbnailphoto.split(',')[1];
    } else {
      data.thumbnailphoto = null
    }

    if (data.position_id) {data.position_id = data.position_id.id}

    toast.success('Данные отправлены')
    
    props.handleActionEmployee(data)
    props.handleClose();
    
    reset(defaultValues);
  }

  // Get base64 format from userpicture
  const getNewAvatarUrl = (event: ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files
    if (file) {
      setImageToUpload(URL.createObjectURL(file[0]));
    }
  };

  const setUserPicFieldValue = (canvas: any, context: any, squareSize: number, isformatted: boolean, event: any, phototype: any) => {
    canvas.width = squareSize;
    canvas.height = squareSize;
    context.drawImage(event.target, 0, 0, squareSize, squareSize);

    const fileUrl = context.canvas.toDataURL('image/jpeg', 1.0)

    if (isformatted) {
      setValue(phototype, fileUrl.split(',')[1]);
    } else {
      setValue(phototype, fileUrl);
    }
  }

  const handleRemoveImage = () => {
    setValue('jpegphoto', '');
    setValue('thumbnailphoto', '');
    setCropper('null');
  }

  const urlToBase64 = async (url: string, isformatted: boolean = true) => {
    //define the width to resize e.g 500 (px)
    const pictureSquareSize = 500;
    const thumbSquareSize = 90;
    const convertedFile = await fetch(url).then((blob) => blob.url);

    if (convertedFile) {
      const userPicCanvas = document.createElement('canvas');
      const userPicContext = userPicCanvas.getContext('2d');
      const userPic = new Image();

      userPic.src = convertedFile;
      userPic.crossOrigin = "anonymous";
      userPic.onload = (event: any) => {
        if (userPicContext && event.target) {
          setUserPicFieldValue(userPicCanvas, userPicContext, pictureSquareSize, isformatted, event, 'jpegphoto');
          setUserPicFieldValue(userPicCanvas, userPicContext, thumbSquareSize, isformatted, event, 'thumbnailphoto');
        }
      }
    }
  }

  // Upload and cropp user photo and thumbnail  
  const getCropData = async () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const fileUrl = cropperRef.current?.cropper.getCroppedCanvas().toDataURL() 
      if (fileUrl) {
        setCropper(fileUrl);
        urlToBase64(fileUrl, false);
      }
     }
  };

  useEffect(() => {
    if (props.editableData) {
      let birthdateFormatted = null;
      
      if (props.editableData.bday) {
        const splittedDate = props.editableData.bday.split('.');
        
        birthdateFormatted = new Date();
        birthdateFormatted.setDate(splittedDate[0]);
        birthdateFormatted.setMonth(parseInt(splittedDate[1]) - 1);
        birthdateFormatted.setFullYear(splittedDate[2]);
      }

      if (props.editableData.jpegphoto) {
        urlToBase64(props.editableData.jpegphoto, false)
      }

      reset({
        id: props.editableData.id,
        name: props.editableData.name,
        bday: birthdateFormatted ?? undefined,
        mobile: props.editableData.mobile ?? '',
        mobile_personal: props.editableData.mobile_personal ?? '',
        email: props.editableData.email ?? '',
        email_personal: props.editableData.email_personal ?? '',
        title: props.editableData.title ?? '',
        note: props.editableData.note ?? '',
        hide_in_all: props.editableData.hide_in_all === 1 ? true : false,
        structure_id: props.editableData.structure_id,
        position_id: props.positions.filter((position: any) => position.id === props.editableData.position_id)[0],
      });
    }

  }, [props.editableData])

  return (
    <>
    <Dialog
      open={props.open}
      onClose={() => {
        props.handleClose()
        reset(defaultValues)
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle id="alert-dialog-title">
          {props.editableData ? 'Редактировать' : 'Добавить'} {"пользователя"}
        </DialogTitle>
        <DialogContent>
          {/* Name: */}
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Имя пользователя'
                    onChange={onChange}
                    placeholder='Имя пользователя'
                    error={Boolean(errors.name)}
                    aria-describedby='validation-schema-name'
                  />
                )}
              />
              {errors.name && (
                <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-name'>
                  {errors.name.message}
                </FormHelperText>
              )}
          </FormControl>
          
          {/* Birthdate: */}
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              control={control}
              name='bday'
              render={({ field: { value, onChange } }) => (
                <DatePickerWrapper>
                  <DatePicker
                    placeholderText='Выберите дату'
                    locale='ru'
                    onChange={onChange}
                    selected={value}
                    dateFormat="dd.MM.yyyy"
                    customInput={
                      <DateCustomInput label='Дата рождения' />
                    }
                  />
                </DatePickerWrapper>
              )}
            />
          </FormControl>

          {/* Job Phone (field mobile): */}
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name='mobile'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Рабочий телефон'
                  onChange={onChange}
                  placeholder='Рабочий телефон'
                  error={Boolean(errors.mobile)}
                  aria-describedby='validation-schema-mobile'
                />
              )}
            />
            {errors.mobile && (
              <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile'>
                {errors.mobile.message}
              </FormHelperText>
            )}
          </FormControl>

          {/* Personal Mobile: */}
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name='mobile_personal'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <MuiTelInput 
                  value={value} 
                  onChange={onChange} 
                  onlyCountries={['RU']}
                  defaultCountry="RU"
                  disableDropdown
                  langOfCountryName="ru"
                  forceCallingCode
                  />
              )}
              />
              {errors.mobile_personal && (
                <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile_personal'>
                  {errors.mobile_personal.message}
                </FormHelperText>
              )}
            </FormControl>

            {/* Job Email: */}
            <FormControl fullWidth sx={{ mt: 4 }}>
              <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Имэйл'
                      type='email'
                      onChange={onChange}
                      placeholder='Имэйл'
                      error={Boolean(errors.email)}
                      aria-describedby='validation-schema-email'
                    />
                  )}
                />
                {errors.email && (
                  <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-email'>
                    {errors.email.message}
                  </FormHelperText>
                )}
            </FormControl>

            {/* Note field: */}
            <FormControl fullWidth sx={{ mt: 4 }}>
              <Controller
                  name='note'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Заметка'
                      type='note'
                      onChange={onChange}
                      placeholder='Заметка'
                      error={Boolean(errors.note)}
                      aria-describedby='validation-schema-note'
                    />
                  )}
                />
                {errors.note && (
                  <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-note'>
                    {errors.note.message}
                  </FormHelperText>
                )}
            </FormControl>

            {/* Structure: */}
            <FormControl fullWidth sx={{ mt: 4 }}>
              <Controller
                name='structure_id'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <StructureSelect
                    value={value}
                    structure={props.structure} 
                    onChange={onChange}
                    error={Boolean(errors.structure_id)}
                  />  
                )}
              />
              {errors.structure_id && (
                <FormHelperText sx={{ color: 'error.main' }} id='validation-structure-select'>
                  Поле обязательно для заполнения
                </FormHelperText>
              )}
            </FormControl>

            {/* Position: */}
            <Grid container spacing={2}>
              <Grid item xs={8}>
              
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <Controller
                    name='position_id'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value,  onChange } }) => (
                      <>
                      <Autocomplete 
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        onChange={(_, newValue: any) => {
                          onChange(newValue)
                          setValue('title', newValue?.name)
                        }}
                        value={value}
                        options={props.positions}
                        renderInput={(params) => <TextField {...params} error={Boolean(errors.position_id)} label="Должность" />}
                        getOptionLabel={(option: any) => option.name}
                        isOptionEqualToValue={(option: any, value: any) => {
                          return option.id === value.id;
                        }}
                        renderOption={(props: any, option: any) => {
                          return (
                            <li {...props} key={option.id}>
                              {option.name}
                            </li>
                          );
                        }}
                        noOptionsText="Должность не найдена"
                        />
                      </>
                    )}
                  />
                  {errors.position_id && (
                    <FormHelperText sx={{ color: 'error.main' }} id='validation-position-select'>
                      Поле обязательно для заполнения
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Add position: */}
              <Grid item xs={4}>
                <Box sx={{ mt: 6 }}>
                  или &nbsp;
                  <Button href="/positions" component={Link} variant="outlined">
                    Добавить должность
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Hide from common list: */}
            <FormControl fullWidth sx={{ mt: 4 }}>
              <Controller
                name='hide_in_all'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={onChange} 
                      />
                    } 
                    label="Скрыть в общем списке пользователей" 
                  />
                )}
              />
            </FormControl>

            {/* User photo: */}
            <FormControl fullWidth sx={{ mt: 4 }}>
              <Controller
                  name='jpegphoto'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <>
                      <Box sx={{ mt: 4, display: 'flex' }}>
                        <label htmlFor="upload-photo">
                          {'Изображение пользователя: '}
                          <input
                              style={{ display: 'none' }}
                              id="upload-photo"
                              name="upload-photo"
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={getNewAvatarUrl}
                          />
                          <Button 
                            variant='contained'
                            color='primary'
                            component="span"
                            >
                            {'Выбрать файл'}
                          </Button>
                        </label>

                        <Button 
                          disabled={!imageToUpload}
                          sx={{ ml: 2 }} 
                          onClick={getCropData}
                          variant='contained'
                          color='secondary'
                          >
                          {'Обрезать'}
                        </Button>
                      </Box>
                      <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
                          <Avatar 
                            style={{ width: "100px", height: '100px' }} 
                            src={cropper ? value : props.editableData?.thumbnailphoto} 
                            alt="Фото пользователя" />

                          { value || props.editableData?.thumbnailphoto ? 
                            <Button 
                              variant='outlined'
                              color='error'
                              onClick={handleRemoveImage} 
                              sx={{ ml: 2 }}
                              startIcon={<Icon icon='mdi:delete-outline' />}
                              >Удалить</Button>:null
                          }
                        </Box>

                        <Cropper
                          aspectRatio={1 / 1}
                          initialAspectRatio={1}
                          ref={cropperRef}
                          src={imageToUpload}
                          viewMode={1}
                          background={false}
                          responsive={true}
                          guides={true}
                          checkOrientation={false}
                          modal={true}
                        />
                      </Box>
                    </>
                  )}
                />
                {errors.jpegphoto && (
                  <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-name'>
                    Поле обязательно для заполнения
                  </FormHelperText>
                )}
            </FormControl>

            {/* User thumb: */}
            <FormControl fullWidth sx={{ mt: 4 }}>
              <Controller
                  name='thumbnailphoto'
                  control={control}
                  rules={{ required: true }}
                  render={() => (
                    <TextField sx={{ display: 'none' }} />
                  )}
                />
            </FormControl>
            <FormControl fullWidth sx={{ mt: 4 }}>
              <Controller
                  name='id'
                  control={control}
                  rules={{ required: true }}
                  render={() => (
                    <TextField sx={{ display: 'none' }} />
                  )}
                />
            </FormControl>

        </DialogContent>

        <DialogActions>
          <Button 
            autoFocus
            variant='contained'
            color='primary'
            type='submit'
            disabled={!isDirty || !isValid} 
            >
            Добавить
          </Button>
          <Button 
            onClick={() => {
              props.handleClose()
              reset(defaultValues)
            }} >
            Отменить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
    </>
  )

}

export default EmployeeAction;
