import { useEffect } from 'react';

// ** MUI imports
import Button from '@mui/material/Button';
import Box, { BoxProps } from '@mui/material/Box'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { styled } from '@mui/material/styles'

// ** Types
import { NewStructure } from 'src/types/structure-types';

// ** Third Party Imports
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import StructureSelect from 'src/views/structure/structure-select';
import { useForm, Controller } from 'react-hook-form';

const rootStructure = '00000000-0000-0000-0000-000000000000';

const defaultValues: NewStructure = {
  name: '',
  parent_id: rootStructure,
  sort: 9999
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
  structure_pid: yup
    .string()
})

const DialogInnerContainer = styled(Box)<BoxProps>(({ theme }) => ({
  minWidth: 500
}))

const ActionStructure = (props: any) => {
  // ** Hook useForm
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: any) => {
    if (!data.parent_id) {
      data.parent_id = rootStructure;
    }

    toast.success('Данные отправлены')
    
    props.handleActionStructure(data)
    props.handleClose();
    
    reset(defaultValues);
  }

  useEffect(() => {
    if (props.editableData) {
      reset({
        id: props.editableData.id,
        name: props.editableData.name,
        parent_id: props.editableData.pid,
        sort: 9999
      })
    } else {
      reset(defaultValues)
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
          <DialogInnerContainer>
            <DialogTitle id="alert-dialog-title">
              {props.editableData ? 'Редактировать' : 'Добавить'} {"структуру"}
            </DialogTitle>
            <DialogContent>
              {/* Name */}
              <FormControl fullWidth sx={{ mt: 4 }}>
                <Controller 
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Имя структуры'
                      onChange={onChange}
                      placeholder='Имя структуры'
                      error={Boolean(errors.name)}
                      aria-describedby='validation-schema-name'
                    />
                  ) }
                />
              </FormControl>
              {errors.name && (
                <FormHelperText sx={{ color: 'error.main' }} id='validation-schema-name'>
                  {errors.name.message}
                </FormHelperText>
              )}

              {/* Parent Structure: */}
              <FormControl fullWidth sx={{ mt: 4 }}>
                <Controller
                  name='parent_id'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <StructureSelect
                      value={value}
                      structure={props.structure} 
                      onChange={onChange}
                      label={'Родительская структура'}
                    />
                  )}
                />
              </FormControl>
              <FormHelperText >
                По умолчанию задан корневой раздел структуры
              </FormHelperText>

            </DialogContent>
            <DialogActions>
              <Button 
                autoFocus
                variant='contained'
                color='primary'
                type='submit'
                disabled={!isDirty || !isValid} 
                >
                {props.editableData ? 'Сохранить' : 'Добавить'}
              </Button>
              <Button 
                onClick={() => {
                  props.handleClose()
                  reset(defaultValues)
                }} >
                Отменить
              </Button>
            </DialogActions>
          </DialogInnerContainer>
        </form>
      </Dialog>
    </>
  );
}

export default ActionStructure