import { useState, ChangeEvent, useRef, useEffect } from 'react';

// ** MUI imports
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// @todo - finish upload and crop as separate component
// import UploadAndCrop from 'src/views/upload-and-crop/upload-and-crop';

const defaultValues = {
  id: '',
  name: '',
  description: '',
  phone: '',
  mobile_phone: '',
  email: '',
  link_name: '',
  link_url: '',
  hide: false,
  image: ''
}

const messages = {
  required: 'Поле обязательно для заполнения'
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
    .required(messages.required),
  description: yup
    .string()
    .required(messages.required),
  phone: yup
    .string()
    .nullable()
    .matches(/^(|.\d{4,5})$/, "Введите 5 чисел"),
  mobile_phone: yup
    .string().nullable(),
  email: yup
    .string()
    .nullable()
    .email('Проверьте правильность написания адреса'),
  link_name: yup
    .string(),
  link_url: yup
    .string()
    .matches(/^(|https?:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?)$/, 'Введите корректную ссылку'),
  image: yup
    .string()
    .required(messages.required),
})


const ActionContact = (props: any) => {
  const [imageToUpload, setImageToUpload] = useState<any>()
  const [cropper, setCropper] = useState<any>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty, isValid }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: any) => {
    if (data.email?.length == 0) {data.email = null}
    if (data.phone?.length == 0) {data.phone = null}
    if (data.mobile_phone?.length == 0) {data.mobile_phone = null}
    if (data.link_url?.length == 0) {data.link_url = null}
    if (data.link_name?.length == 0) {data.link_name = null}
    if (data.image) {
      data.image = data.image.split(',')[1]
    }

    // sometimes hide could be bool, sometimes - int
    if (data.hide === 1) { data.hide = true } else if (data.hide === 0) { data.hide = false }

    toast.success('Данные отправлены')

    console.log(data)
    
    props.handleSave(data)
    props.handleClose();
    
    reset(defaultValues);
  }

  // Get base64 format from userpicture
  const getNewAvatarUrl = (e: ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files
    if (file) {
      setImageToUpload(URL.createObjectURL(file[0]));
    }
  };

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

  const handleRemoveImage = () => {
    setValue('image', '');
    setCropper('null');
  }

  const urlToBase64 = async (url: string, isformatted: boolean = true) => {
    //define the width to resize e.g 500 (px)
    const pictureSquareSize = 500;
    const convertedFile = await fetch(url).then((blob) => blob.url);

    if (convertedFile) {
      const userPicCanvas = document.createElement('canvas');
      const userPicContext = userPicCanvas.getContext('2d');
      const userPic = new Image();

      userPic.src = convertedFile;
      userPic.crossOrigin = "anonymous";
      userPic.onload = (event: any) => {
        if (userPicContext && event.target) {
          setImageFieldValue(userPicCanvas, userPicContext, pictureSquareSize, isformatted, event);
        }
      }
    }
  }

  const setImageFieldValue = (canvas: any, context: any, squareSize: number, isformatted: boolean, event: any) => {
    canvas.width = squareSize;
    canvas.height = squareSize;
    context.drawImage(event.target, 0, 0, squareSize, squareSize);

    const fileUrl = context.canvas.toDataURL('image/jpeg', 1.0)

    if (isformatted) {
      setValue('image', fileUrl.split(',')[1]);
    } else {
      setValue('image', fileUrl);
    }
  }

  useEffect(() => {
    if (props.editableData) {
      if (props.editableData.image) {
        urlToBase64(props.editableData.image, false)
      }

      reset({
        id: props.editableData.id,
        name: props.editableData.name,
        description: props.editableData.description,
        phone: props.editableData.phone ?? '',
        mobile_phone: props.editableData.mobile_phone ?? '',
        email: props.editableData.email ?? '',
        link_name: props.editableData.link?.name ?? '',
        link_url: props.editableData.link?.url ?? '',
        image: props.editableData.image ?? '', 
        hide: props.editableData.hide ?? false,
      })
    }
  }, [props.editableData])

  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle id="alert-dialog-title">
            {"Добавить новый контакт сервиса"}
          </DialogTitle>
          <DialogContent>

          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField 
                  value={value}
                  label="Наименование контакта" 
                  onChange={onChange}
                  placeholder="Наименование контакта" 
                  error={Boolean(errors.name)}
                  aria-describedby='validation-schema-name'
                />
              )}
            />
            {errors.name && (
              <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile'>
                {errors.name.message}
              </FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller 
              name="description"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  id="contact-service-name" 
                  value={value}
                  label="Описание" 
                  variant="outlined"
                  placeholder="Наименование контакта" 
                  multiline
                  rows={4}
                  error={Boolean(errors.description)}
                  name="description"
                  onChange={onChange}
                />
              )}
            />
            {errors.description && (
              <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile'>
                {errors.description.message}
              </FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller 
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField 
                  id="contact-service-email" 
                  value={value}
                  label="Электронная почта отдела" 
                  variant="outlined" 
                  onChange={onChange}
                  placeholder="Электронная почта отдела" 
                  error={Boolean(errors.email)}
                />
              )}
            />
            {errors.email && (
              <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile'>
                {errors.email.message}
              </FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name='phone'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField 
                  id="contact-service-phone" 
                  value={value}
                  label="Телефон" 
                  variant="outlined" 
                  placeholder="Электронная почта отдела" 
                  name="phone"
                  onChange={onChange}
                />
              )}
            />
            {errors.phone && (
              <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile'>
                {errors.phone.message}
              </FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name='mobile_phone'
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
              {errors.mobile_phone && (
                <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile'>
                  {errors.mobile_phone.message}
                </FormHelperText>
              )}
          </FormControl>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name="link_name"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextField 
                  id="contact-service-link-name" 
                  label="Текст ссылки"
                  placeholder="Текст ссылки" 
                  variant="outlined"
                  value={value} 
                  error={Boolean(errors.link_name)}
                  onChange={onChange}
                />
              )}
              />
              {errors.link_name && (
                <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile'>
                  {errors.link_name.message}
                </FormHelperText>
              )}
          </FormControl>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name="link_url"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextField 
                  id="contact-service-link-url" 
                  label="Ссылка"
                  placeholder="Ссылка"
                  variant="outlined"
                  value={value}
                  error={Boolean(errors.link_url)}
                  onChange={onChange}
                />
              )}
              />
              {errors.link_url && (
                <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-mobile'>
                  {errors.link_url.message}
                </FormHelperText>
              )}
          </FormControl>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name="hide"
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormControlLabel 
                    control={<Checkbox checked={value} onChange={onChange} />} 
                    label="Скрывать контакт сервисной службы" 
                  />
              )}
              />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <Controller
              name='image'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <>
                  {/*  @todo - finish splitting component! */}
                  {/* <UploadAndCrop
                    value={value} 
                    onChange={onChange} 
                  /> */}

                  <Box sx={{ mt: 4, display: 'flex' }}>
                    <label htmlFor="upload-photo">
                      {'Изображение сервиса: '}
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
                      onClick={(e) => {
                        getCropData()
                        onChange(e)
                        setValue('image', imageToUpload);
                      }}
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
                        src={cropper ? value : props.editableData?.image} 
                        alt="Фото пользователя" />

                      { value || props.editableData?.image ? 
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
                      background={true}
                      responsive={true}
                      guides={true}
                      checkOrientation={false}
                      modal={true}
                    />
                  </Box>
                </>
              )}
            />
            {errors.image && (
              <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-name'>
                {errors.image.message}
              </FormHelperText>
            )}
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
              onClick={props.handleClose} 
              autoFocus>
              Отменить
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default ActionContact;