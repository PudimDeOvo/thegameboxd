from pydantic import BaseModel, Field, model_validator

class ResetPasswordSchema(BaseModel):

    new_password: str = Field(min_length=8)
    new_password_confirmation: str

    @model_validator(mode='after')
    def check_passwords_match(self):
        pw1 = self.new_password
        pw2 = self.new_password_confirmation
        
        if pw1 is not None and pw1 != pw2:
            raise ValueError('A nova senha e a confirmação não batem.')
        return self