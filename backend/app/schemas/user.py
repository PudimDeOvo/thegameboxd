
from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional


class UserSchemaPublic(BaseModel):

    id: int
    username: str
    email: EmailStr
    admin: bool

    

    class Config:
        from_attributes = True

class UserPictureUrls(BaseModel):

    profile_pic_url: str | None = None
    background_pic_url: str | None = None
    
    class Config:
        from_attributes = True

class UserSchemaList(BaseModel):

    items: list[UserSchemaPublic]
    total: int


class UserSchema(BaseModel):

    username: str
    email: EmailStr
    password: str


class UserSchemaUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserChangePasswordSchema(BaseModel):

    old_password: str
    new_password: str = Field(min_length=8)
    new_password_confirmation: str

    @model_validator(mode='after')
    def check_passwords_match(self):
        pw1 = self.new_password
        pw2 = self.new_password_confirmation
        if pw1 is not None and pw1 != pw2:
            raise ValueError('A nova senha e a confirmação não batem.')
        return self

class UserEmailChangeRequestSchema(BaseModel):

    new_email: EmailStr