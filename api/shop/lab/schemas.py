from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Username = Annotated[str, StringConstraints(
    strip_whitespace=True, to_lower=True, pattern=r"^[a-z0-9_]{3,32}$",
)]


class DiskInput(BaseModel):
    title: Title
    price_rub: int = Field(gt=0)
    stock: int = Field(ge=0)


class DiskOutput(DiskInput):
    model_config = ConfigDict(from_attributes=True)

    id: int


class Credentials(BaseModel):
    username: Username
    password: str

    @field_validator("password")
    @classmethod
    def check_bcrypt_size(cls, password: str) -> str:
        if len(password) < 12 or len(password.encode("utf-8")) > 72:
            raise ValueError("Пароль должен содержать от 12 символов и занимать не более 72 байт UTF-8")
        return password


class UserOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str


class TokenOutput(BaseModel):
    access_token: str
    token_type: str = "bearer"
