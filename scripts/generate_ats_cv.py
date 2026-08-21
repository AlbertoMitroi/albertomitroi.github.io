#!/usr/bin/env python3
"""Generate the public, ATS-friendly PDF resume."""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "CV_AlbertoMitroi.pdf"

NAVY = HexColor("#172033")
BLUE = HexColor("#1769AA")
GRAY = HexColor("#4B5563")


def styles():
    base = getSampleStyleSheet()
    return {
        "name": ParagraphStyle(
            "Name",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=21,
            leading=24,
            textColor=NAVY,
            spaceAfter=2,
        ),
        "role": ParagraphStyle(
            "Role",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11.5,
            leading=14,
            textColor=BLUE,
            spaceAfter=4,
        ),
        "contact": ParagraphStyle(
            "Contact",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.6,
            leading=11,
            textColor=GRAY,
            spaceAfter=7,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10.2,
            leading=12,
            textColor=NAVY,
            spaceBefore=6,
            spaceAfter=3,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.7,
            textColor=NAVY,
            alignment=TA_LEFT,
            spaceAfter=3,
        ),
        "skills": ParagraphStyle(
            "Skills",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=10.2,
            textColor=NAVY,
            spaceAfter=2,
        ),
        "company": ParagraphStyle(
            "Company",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9.4,
            leading=11.2,
            textColor=NAVY,
            spaceBefore=4,
            spaceAfter=1,
            keepWithNext=True,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.1,
            leading=9.8,
            textColor=GRAY,
            spaceAfter=2,
            keepWithNext=True,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.25,
            leading=10.2,
            textColor=NAVY,
            leftIndent=9,
            firstLineIndent=-7,
            spaceAfter=1.4,
        ),
    }


def section(story, style, title):
    story.append(Paragraph(title, style["section"]))


def bullet(story, style, text):
    story.append(Paragraph(f"- {text}", style["bullet"]))


def job(story, style, company, location, title, period, bullets):
    story.append(Paragraph(f"{company} | {location}", style["company"]))
    story.append(Paragraph(f"{title} | {period}", style["meta"]))
    for item in bullets:
        bullet(story, style, item)


def project(story, style, name, context, bullets):
    story.append(Paragraph(name, style["company"]))
    story.append(Paragraph(context, style["meta"]))
    for item in bullets:
        bullet(story, style, item)


def set_metadata(canvas, document):
    canvas.setTitle("Alberto Mitroi - Full Stack Software Engineer")
    canvas.setAuthor("Alberto Mitroi")
    canvas.setSubject("Full Stack Software Engineer resume: C# .NET Azure React TypeScript Applied AI")
    canvas.setKeywords("Full Stack Software Engineer, C#, .NET, ASP.NET Core, Microsoft Azure, React, Next.js, TypeScript, Angular, Distributed Systems, Applied AI, RAG, Azure OpenAI")


def build():
    style = styles()
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=8 * mm,
        bottomMargin=8 * mm,
        title="Alberto Mitroi - Full Stack Software Engineer",
        author="Alberto Mitroi",
        subject="Full Stack Software Engineer resume",
    )

    story = [
        Paragraph("Alberto Mitroi", style["name"]),
        Paragraph("Full Stack Software Engineer | C#/.NET, Azure, React, TypeScript | Applied AI", style["role"]),
        Paragraph(
            "Craiova, Romania | mitroialbertoionut@gmail.com | "
            '<link href="https://www.linkedin.com/in/mitroialberto/">linkedin.com/in/mitroialberto</link> | '
            '<link href="https://albertomitroi.github.io/">albertomitroi.github.io</link> | '
            '<link href="https://github.com/AlbertoMitroi">github.com/AlbertoMitroi</link>',
            style["contact"],
        ),
    ]

    section(story, style, "SUMMARY")
    story.append(
        Paragraph(
            "Full Stack Software Engineer with experience in C#/.NET 8, ASP.NET Core, Microsoft Azure, React, Next.js, "
            "TypeScript and Angular. Builds REST APIs, distributed services and user-facing web applications. Work includes "
            "microservices, event-driven architecture, Kafka, RabbitMQ, CQRS, Domain-Driven Design, event sourcing, Docker, "
            "CI/CD, Azure DevOps and applied AI with Azure OpenAI, retrieval-augmented generation (RAG) and LLM workflows.",
            style["body"],
        )
    )

    section(story, style, "CORE SKILLS")
    skill_lines = [
        ("Languages", "C#, TypeScript, JavaScript, Python, SQL"),
        ("Backend", ".NET 8, ASP.NET Core, REST APIs, Microservices, Entity Framework Core"),
        ("Frontend", "React, Next.js, Angular"),
        ("Cloud and delivery", "Microsoft Azure, Azure DevOps, Docker, CI/CD"),
        ("Distributed systems", "Kafka, RabbitMQ, Event-Driven Architecture, CQRS, Domain-Driven Design, Event Sourcing, Marten, Elasticsearch"),
        ("Applied AI", "Azure OpenAI, RAG, Large Language Models, Semantic Search, AI Agents"),
    ]
    for label, value in skill_lines:
        story.append(Paragraph(f"<b>{label}:</b> {value}", style["skills"]))

    section(story, style, "EXPERIENCE")
    job(
        story,
        style,
        "Oryntech.AI",
        "Craiova, Romania (Remote)",
        "AI Solutions Engineer &amp; Co-CTO",
        "Mar 2026 - Present | Part-time",
        [
            "Translate service-business workflows into full-stack features, integrations, conversational agents and automation.",
            "Build React, Next.js and TypeScript interfaces connected to APIs, webhooks, CRM, booking and follow-up workflows.",
            "Implement voice and chat agents with context management, guardrails, human handoff, testing and reliability controls.",
        ],
    )
    job(
        story,
        style,
        "Encora Inc.",
        "Craiova, Romania (Hybrid)",
        ".NET Full Stack Developer",
        "Oct 2024 - Present | Full-time",
        [
            "Develop .NET 8 services, REST APIs and Angular features for a distributed insurance platform serving the UK market.",
            "Build asynchronous workflows with Kafka, RabbitMQ and Azure Service Bus across a microservices architecture.",
            "Apply CQRS, Domain-Driven Design and event sourcing with Marten and PostgreSQL; use Elasticsearch for operational and search views.",
            "Contribute to testing, Azure delivery, incident analysis and operational reliability within the product team.",
        ],
    )
    job(
        story,
        style,
        "Encora Inc.",
        "Craiova, Romania (Hybrid)",
        "Full Stack Development Intern",
        "Jul 2024 - Oct 2024",
        [
            "Contributed to a trading application using .NET 8 backend services and Angular frontend features.",
            "Used Azure DevOps, Git, CI/CD, dependency injection and automated testing in a professional delivery workflow.",
        ],
    )
    job(
        story,
        style,
        "FORVIA HELLA",
        "Craiova, Romania (Hybrid)",
        "Software Automation Intern",
        "Nov 2023 - Jul 2024",
        [
            "Built internal automation scripts and desktop tools with Python, C# and VBA.",
            "Supported software testing for automotive control systems and worked with engineers to improve validation workflows.",
        ],
    )

    section(story, style, "PROJECTS")
    project(
        story,
        style,
        "EShopMicroservices",
        "Public repository: github.com/AlbertoMitroi/EShopMicroservices",
        [
            "Built a .NET 8 and C# 12 e-commerce reference architecture using microservices, ASP.NET Core, Entity Framework Core, DDD and CQRS.",
            "Implemented RabbitMQ and Kafka messaging, Docker packaging, GitHub Actions and Azure-oriented deployment patterns.",
        ],
    )
    project(
        story,
        style,
        "Oryntech.AI",
        "Full-stack product and applied AI work",
        [
            "Develop React, Next.js and TypeScript product interfaces for AI-assisted service-business workflows.",
            "Integrate conversational and voice agents with CRM, email, SMS, booking, analytics, APIs and webhooks.",
        ],
    )
    project(
        story,
        style,
        "TopZonal",
        "In development",
        [
            "Build a mobile-first local-services product with React, Next.js, TypeScript and .NET components.",
            "Prototype semantic search, vector retrieval and RAG-assisted discovery with Azure-oriented infrastructure.",
        ],
    )

    section(story, style, "EDUCATION")
    story.append(Paragraph("Faculty of Automation, Computers and Electronics | University of Craiova", style["company"]))
    story.append(Paragraph("Computer Science | Sept 2022 - Jul 2026 | Craiova, Romania", style["meta"]))

    section(story, style, "CERTIFICATIONS")
    certs = [
        "Microsoft Certified: Azure Developer Associate (AZ-204) | Microsoft | Credential ID 42EFC399D66B1E5C | Mar 2026",
        "Introduction to Generative AI for Software Development | DeepLearning.AI | Credential ID G503GKSPZ3IO | Jul 2025",
        "Generative AI with Large Language Models | Amazon Web Services | Credential ID A3COZZP9ND79 | Jul 2025",
        ".NET 8 Microservices: DDD, CQRS, Vertical/Clean Architecture | Udemy | Jul 2025",
    ]
    for cert in certs:
        bullet(story, style, cert)

    document.build(story, onFirstPage=set_metadata, onLaterPages=set_metadata)


if __name__ == "__main__":
    build()
