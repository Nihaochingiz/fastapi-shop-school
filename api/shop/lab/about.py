from fastapi import APIRouter

router = APIRouter()


@router.get("/about")
def about():
    return {"module": "shop.lab.about"}
